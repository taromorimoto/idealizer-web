var Things = {

    loadModelCollection: function() {

        Things.Thing = Backbone.Model.extend({

            urlRoot: '/things',

            defaults: function() {
                return {
                    key: '',
                    name: '',
                    date: '',
                    properties: [],
                }
            },

            name: function() {
                return this.get('name')
            },

            image: function() {
                var url
                this.properties().some(function(p) {
                     if (p.type == 'image' && p.value && p.value.length > 0) {
                        url = p.value[0].url
                        return true
                     }
                })
                return url
            },

            practice: function() {
                return idea.practice(this.get('parent'))
            },

            properties: function() {
                return this.get('properties')
            }

        })

        Things.ThingCollection = Backbone.Collection.extend({
            
            model: Things.Thing,

            url: '/things',

            add: function(models, options) {
                _.each(models, function(model) {
                    if (model.key)
                        model.id = model.key
                })

                Backbone.Collection.prototype.add.call(this, models, options);
            }
        })
    },


    loadViews: function() {

        Things.ThingsGridView = Backbone.View.extend({

            el: '#things-grid',

            template: _.template($('#things-grid-template').html()),

            events: {
                "click button.new-thing" : "showCreateNew",
                "click .thing a"      : "showThing"
            },

            initialize: function() {
                this.listenTo(this.collection, 'add', this.added)
                this.listenTo(this.collection, 'destroy', this.destroyed)
                this.listenTo(this.collection, 'sync', this.saved)

                this.render()
            },

            render: function() {
                console.log('ThingsGridView.render')

                this.$el.html(this.template({ things: this.collection.models }))

                return this
            },

            showThing: function(e) {
                e.stopPropagation()
                e.preventDefault()

                var id = $(e.target).closest('.thing').attr('thing-id')
                var model = this.collection.get(id)
                console.log('Show Thing', model)
                this.thingView = new Things.ThingView({ model: model })
                this.thingView.$el.show().addClass('slide-in')

                return false
            },

            showCreateNew: function() {
                var model = new Things.Thing({
                    properties: idea.selectedPractice().properties()
                })
                if (this.editor) {
                    this.editor.setModel(model)
                } else {
                    this.editor = new Things.EditThingView({
                        model: model,
                        collection: this.collection
                    })
                }
                this.editor.$el.show().addClass('slide-in')
            }
        })

        Things.EditThingView = Backbone.View.extend({

            el: '#edit-thing',

            template: _.template($('#edit-thing-template').html()),

            events: {
                "click button.close-edit-thing" : "close",
                "click button:last"             : "save",
                "change .thing-name"            : "setName"
            },

            initialize: function(options) {
                this.render()
            },

            setModel: function(model) {
                this.model = model
                this.render()
            },

            render: function() {
                console.log('EditThingView.render')

                this.$el.html(this.template({ thing: this.model, practiceName: idea.practiceName() }))

                this.$('form').submit(function(e) {
                    e.preventDefault()
                    e.stopPropagation()
                    return false
                })
                this.$properties = this.$('.thing-properties')

                this.propertyViews = []
                _.each(this.model.properties(), this.appendProperty.bind(this))

                return this
            },

            close: function() {
                this.$el.removeClass('slide-in')
            },

            newProperty: function() {
                var property = {}
                this.model.properties().push(property)
                this.appendProperty(property)
            },

            appendProperty: function(property) {
                var view = new Things.EditPropertyViews[property.type]({ property: property })
                this.$properties.append(view.$el)
            },

            setName: function(e) {
                this.model.set({ name: $(e.target).val() })
            },

            spinner: function(show) {
                this.$('.idea-load-spin:last').toggle(show == true)
            },

            save: function() {
                var self = this
                var isNew = this.model.isNew()
                console.log('Saving Thing', this.model)
                this.spinner(true)
                this.model.save()
                    .done(function(data) { 
                        self.model.id = data.id
                        self.model.set('key', data.id)
                        if (isNew) self.collection.add(self.model)
                        console.log('Saved Thing ', self.model)
                    })
                    .fail(function() { 
                        console.log('Failed to save Thing ', self.model)
                    })
                    .always(function() {
                        self.spinner(false) 
                    })
            }
        })

        Things.EditPropertyViews = {}

        Things.EditPropertyViews.text = Backbone.View.extend({
            template: _.template($('#edit-text-property-template').html()),

            events: {
                'change input' : 'changed'
            },

            initialize: function(options) {
                _.defaults(options.property, { value: options.property.size > 1 ? [] : '' });
                this.property = options.property
                this.render()
            },

            render: function() {
                this.$el.html(this.template(this.property))
            },

            changed: function(e) {
                var value = $(e.target).val()
                if (this.property.size > 1) {
                    var index = parseInt($(e.target).attr('index'))
                    this.property.value[index] = value
                } else {
                    this.property.value = value
                }
            }
        })

        Things.EditPropertyViews.image = Backbone.View.extend({
            template: _.template($('#edit-image-property-template').html()),

            events: {
            },

            initialize: function(options) {
                _.defaults(options.property, { value: [] });
                this.property = options.property
                this.render()
            },

            render: function() {
                this.$el.html(this.template(this.property))

                this.images = new ImagesView({
                    el: this.$('.image-uploads'),
                    max: this.property.size,
                    images: this.property.value
                })

                /*
                this.listenTo(this.images, 'change', function(images) {
                    this.property.length = 0
                    _.extend(this.property, images)
                })*/
            }
        })

        /**
         *  Thing details view
         */
        Things.ThingView = Backbone.View.extend({

            el: '#thing-details',

            template: _.template($('#thing-details-template').html()),

            events: {
                "click button.close-thing-details" : "close"
            },

            initialize: function(options) {
                this.render()
            },

            setModel: function(model) {
                this.model = model
                this.render()
            },

            render: function() {
                console.log('ThingView.render')

                this.$el.html(this.template({ thing: this.model }))

                this.$properties = this.$('.thing-properties')

                this.propertyViews = []
                _.each(this.model.properties(), this.appendProperty.bind(this))

                return this
            },

            close: function() {
                this.$el.removeClass('slide-in')
            },

            appendProperty: function(property) {
                var view = new Things.PropertyViews[property.type]({ property: property })
                this.$properties.append(view.$el)
            }

        })

        Things.PropertyViews = {}

        Things.PropertyViews.text = Backbone.View.extend({
            template: _.template($('#text-property-template').html()),

            initialize: function(options) {
                _.defaults(options.property, { value: options.property.size > 1 ? [] : '' });
                this.property = options.property
                this.render()
            },

            render: function() {
                this.$el.html(this.template(this.property))
            }
        })

        Things.PropertyViews.image = Backbone.View.extend({
            template: _.template($('#image-property-template').html()),

            initialize: function(options) {
                _.defaults(options.property, { value: [] });
                this.property = options.property
                this.render()
            },

            render: function() {
                this.$el.html(this.template(this.property))
            }
        })

    }
}

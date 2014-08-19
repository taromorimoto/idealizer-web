var Things = {

    loadModelCollection: function() {

        Things.Thing = Backbone.Model.extend({

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
                "click .idea-thing"      : "showThing"
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

            showThing: function() {
                this.model = this.selected()
                console.log('Selected Thing', this.model)
                this.$delete.toggle(!this.model.isNew())
                this.trigger('select', this.model)
            },

            showCreateNew: function() {
                if (this.editor) this.editor.setModel(new Things.Thing)
                else this.editor =  new Things.EditThingView({ model: new Things.Thing })
                //this.editor.animate()
                this.editor.$el.show().addClass('slide-in')
            }
        })

        Things.EditThingView = Backbone.View.extend({

            el: '#edit-thing',

            template: _.template($('#edit-thing-template').html()),

            events: {
                "click button.close-edit-thing" : "close",
                "click button:last"             : "save",
                "click .button-add"             : "newProperty",
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

                this.$form = this.$('form').submit(function(e) {
                    e.preventDefault()
                    e.stopPropagation()
                    return false
                })
                this.$properties = this.$('#edit-thing-properties')

                this.propertyViews = []
                _.each(this.model.properties(), this.appendProperty.bind(this))

                this.images = new ImageUploadView({ el: this.$('#idea-image-uploads') })

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
                _.defaults(property, { type: '', name: '' });
                var view = new Things.ThingPropertyView({ property: property })
                var index = this.propertyViews.length
                this.propertyViews.push(view)
                this.$properties.append(view.$el)
                this.listenTo(view, 'remove', function() {
                    var properties = this.model.get('properties')
                    index = properties.indexOf(property)
                    console.log('Removing property at index ' + index, property)
                    this.propertyViews.splice(index, 1)
                    properties.splice(index, 1)
                }.bind(this))
            },

            setName: function(e) {
                this.model.set({ name: $(e.target).val() })
            },

            saveSpinner: function(show) {
                this.$form.find('.idea-load-spin:last').toggle(show == true)
            },

            save: function() {
                var self = this
                var isNew = this.model.isNew()
                console.log('Saving Thing', this.model)
                this.saveSpinner(true)
                this.model.save()
                    .done(function() { 
                        if (isNew) self.trigger('sync:new-model')
                        console.log('Saved Thing ', self.model)
                    })
                    .fail(function() { 
                        console.log('Failed to save Thing ', self.model)
                    })
                    .always(function() {
                        self.saveSpinner(false) 
                    })
            }
        })

/*
        Things.ThingPropertyView = Backbone.View.extend({

            template: _.template($('#edit-Thing-property-template').html()),

            types: ['text', 'textarea', 'select', 'radio', 'checkbox', 'image', 'video', 'link'],

            events: {
                "change select"   : "setType",
                "change input"   : "setName",
                "click .button-delete"   : "remove"
            },

            initialize: function(options) {
                this.property = options.property
                this.render()
            },

            render: function() {
                this.$el.html(this.template(_.defaults({ types: this.types }, this.property)))
            },

            setType: function(e) {
                this.property.type = $(e.target).val()
            },

            setName: function(e) {
                this.property.name = $(e.target).val()
            },

            json: function() {
                return {
                    name: this.$('input').val(),
                    type: this.$('select').val()
                }
            },

            remove: function() {
                this.trigger('remove')
                Backbone.View.prototype.remove.apply(this, arguments);
            }
        })
        */

    }
}

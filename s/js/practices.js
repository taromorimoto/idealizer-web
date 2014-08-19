var Practices = {

    loadModelCollection: function() {
        /**
         * Practice has many Things. Things have one practice.
         */
        Practices.Practice = Backbone.Model.extend({

            // Default attributes for a Practice.
            defaults: function() {
                return {
                    key: '',
                    name: '',
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


        Practices.PracticeCollection = Backbone.Collection.extend({
            
            model: Practices.Practice,

            url: '/practices',

            add: function(models, options) {
                _.each(models, function(model) {
                    if (model.key)
                        model.id = model.key
                })

                Backbone.Collection.prototype.add.call(this, models, options);
            }
        })
    },


    loadEditPracticesViews: function() {

        Practices.EditPracticeView = Backbone.View.extend({

            el: '#edit-practice',

            template: _.template($('#edit-practice-template').html()),

            events: {
                "click button:last"   : "save",
                "click .button-add"   : "newProperty",
                "change .practice-name"   : "setName"
            },

            initialize: function(options) {
                this.render()
            },

            setModel: function(model) {
                this.model = model
                this.render()
            },

            render: function() {
                console.log('EditPracticeView.render')

                this.$el.html(this.template({ practice: this.model }))

                this.$form = this.$('#edit-practice-form').submit(function(e) {
                    e.preventDefault()
                    e.stopPropagation()
                    return false
                })
                this.$properties = this.$('#edit-practice-properties')

                // Render properties from model
                this.propertyViews = []
                _.each(this.model.properties(), this.appendProperty.bind(this))

                return this
            },

            newProperty: function() {
                var property = {}
                this.model.properties().push(property)
                this.appendProperty(property)
            },

            appendProperty: function(property) {
                _.defaults(property, { type: '', name: '' });
                var view = new Practices.PracticePropertyView({ property: property })
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
                console.log('Saving Practice', this.model)
                this.saveSpinner(true)
                this.model.save()
                    .done(function() { 
                        if (isNew) self.trigger('sync:new-model')
                        console.log('Saved Practice ', self.model)
                    })
                    .fail(function() { 
                        console.log('Failed to save Practice ', self.model)
                    })
                    .always(function() {
                        self.saveSpinner(false) 
                    })
            }
        })

        Practices.PracticePropertyView = Backbone.View.extend({

            template: _.template($('#edit-practice-property-template').html()),

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
    },

    loadPracticeSelectorView: function() {
        Practices.PracticeSelectorView = Backbone.View.extend({

            el: '#practice-selector',

            template: _.template($('#practice-selector-template').html()),

            events: {
                "change select"        : "select",
                "click .button-delete" : "delete"
            },

            initialize: function(options) {
                this.edit = options.edit

                if (this.edit) {
                    this.listenTo(this.collection, 'add', this.added)
                    this.listenTo(this.collection, 'destroy', this.destroyed)
                    this.listenTo(this.collection, 'sync', this.saved)
                }

                this.render(options.selected)
            },

            render: function(selected) {
                console.log('PracticeSelectorView.render')

                this.$el.html(this.template({ practices: this.collection.models, selected: selected }))

                this.$select = this.$('select')
                this.$delete = this.$('.button-delete')

                return this
            },

            added: function(model) {
                if (model.isNew()) {
                    this.$select.prepend('<option value="' + model.cid + '">Create New...</option>')
                }
            },

            saved: function(model) {
                this.$select.find('option[value="' + model.cid + '"]').text(model.name())
            },

            destroyed: function(model) {
                this.$select.find('option[value="' + model.cid + '"]').remove()
                this.$select.find('option:first').attr('selected', 'selected')
                this.select()
            },

            select: function() {
                this.model = this.selected()
                console.log('Selected practice', this.model.id, this.model)
                if (this.edit) {
                    this.$delete.toggle(!this.model.isNew())
                }
                this.trigger('select', this.model)
            },

            selected: function() {
                return this.collection.get(this.$select.val())
            },

            delete: function() {
                var self = this
                this.model = this.selected()
                console.log('Deleting practice', this.model)
                this.spinner(true)
                this.model.destroy()
                    .done(function() { 
                        console.log('Deleted Practice ', self.model)
                    })
                    .fail(function() { 
                        console.log('Failed to delete Practice ', self.model)
                    })
                    .always(function() {
                        self.spinner(false) 
                    })
            },

            spinner: function(show) {
                this.$('.idea-load-spin').toggle(show == true)
            }
        })
    }
}

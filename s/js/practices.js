$(function(){
    /**
     * Practice has many Things. Things have one practice.
     */
    Idea.Practice = Backbone.Model.extend({

        urlRoot: '/practice',

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


    Idea.PracticeCollection = Backbone.Collection.extend({
        model: Idea.Practice,
        url: '/practices/all',

        add: function(models, options) {
            _.each(models, function(model) {
                if (model.key)
                    model.id = model.key
            })

            Backbone.Collection.prototype.add.call(this, models, options);
        }
    })


    Idea.EditPracticeView = Backbone.View.extend({

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
            var view = new Idea.PracticePropertyView({ property: property })
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

    Idea.PracticePropertyView = Backbone.View.extend({

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

    Idea.PracticeSelectorView = Backbone.View.extend({

        el: '#practice-selector',

        template: _.template($('#practice-selector-template').html()),

        events: {
            "change select"   : "select"
        },

        initialize: function() {
            this.listenTo(this.collection, 'add', this.added)
            this.listenTo(this.collection, 'sync', this.saved)

            this.render()
        },

        render: function() {
            console.log('PracticeSelectorView.render')

            this.$el.html(this.template({ practices: this.collection.models }))

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

        select: function() {
            this.model = this.selected()
            console.log('Selected practice', this.model)
            this.trigger('select', this.model)
        },

        selected: function() {
            return this.collection.get(this.$select.val())
        }
    })

})


/**
 * Individual Practice class
 */
 /*
var Practice = function (data, options) {
    this.keyCounter = 1

    data = data ? data : {}
    this.key = data.key
    this.name = data.name
    this.properties = data.properties ? data.properties : []

    this.$form = options.$form
    this.$properties = this.$form.find('#idea-practice-properties')

    this.init()
}

Practice.prototype.init = function() {
    var self = this
    this.$form.find('.button-add').off().click(function() {
        self.addProperty()
    })
    this.$form.find('[name=practice-name]').off().val(this.name).change(function() {
        self.name = $(this).val()
    })

    this.render()
}

Practice.prototype.clear = function() {
    this.$properties.empty()
}

Practice.prototype.render = function() {
    this.clear()
    for (var i in this.properties) {
        this.renderProperty(this.properties[i])
    }
}

Practice.prototype.renderProperty = function(prop) {
    var self = this
    var fieldset = this.createFieldset(prop)
    this.$properties.append(fieldset)
}

Practice.prototype.addProperty = function(name, type) {
    var prop = {
        key: this.keyCounter++,
        name: name ? name : '',
        type: type ? type : 'text'
    }
    this.properties.push(prop)
    this.renderProperty(prop)
}

Practice.prototype.deleteProperty = function(key) {
    var index
    this.properties.some(function(prop, i) {
        return prop.key == key && (index = i)
    })
    this.properties.splice(index, 1)
    $("fieldset[key='" + key + "']", this.$properties).remove()
}

Practice.prototype.getProperty = function(key) {
    var found
    this.properties.some(function(prop, i) {
        return prop.key == key && (found = prop)
    })
    return found
}

Practice.prototype.toJSON = function() {
    return {
        key: this.key ? this.key : '',
        name: this.name,
        properties: this.properties
    }
}

Practice.prototype.stringify = function() {
    return JSON.stringify(this.toJSON())
}

Practice.types = ['text', 'textarea', 'select', 'radio', 'checkbox', 'image', 'video', 'link']

Practice.createTypeOptions = function(types) {
    types = types ? types : Practice.types
    var select = $('<select name="property-type"></select>')
    for (var i in types) {
        select.append('<option value="' + types[i] + '">' + types[i] + '</option>')
    }
    return select
}

Practice.prototype.createFieldset = function(prop) {
    var self = this

    var set = $('<fieldset></fieldset>').attr('key', prop.key)
    var input = $('<input type="text" name="property-name" value="' + prop.name + '" placeholder="Property name..." required>')
    var types = Practice.createTypeOptions().val(prop.type)
    var button = $('<button class="pure-button button-small button-delete" type="button">Delete</button>')

    button.click(function() {
        self.deleteProperty(prop.key)
    })

    input.change(function() {
        prop.name = $(this).val()
    })

    types.change(function() {
        prop.type = $(this).val()
    })

    return set.append(input, types, button)
}

*/
/**
 * Practice has many Things. Things have one practice.
 */
var Practice = Backbone.Model.extend({

    // Default attributes for a Practice.
    defaults: function() {
        return {
            key = '',
            name = '',
            properties = [],
        }
    },

})

var Practices = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Todo,

    // Save all of the todo items under the `"todos-backbone"` namespace.
    localStorage: new Backbone.LocalStorage("todos-backbone"),

    // Filter down the list of all todo items that are finished.
    done: function() {
        return this.where({done: true});
    },

    // Filter down the list to only todo items that are still not finished.
    remaining: function() {
        return this.where({done: false});
    },

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
        if (!this.length) return 1;
        return this.last().get('order') + 1;
    },

    // Todos are sorted by their original insertion order.
    comparator: 'order'

});


// The DOM element for a todo item...
var EditPracticeView = Backbone.View.extend({

    el: $("#edit-practice"),

    // Cache the template function for a single item.
    practiceTemplate: _.template($('#edit-practice-template').html()),
    propertyTemplate: _.template($('#edit-practice-property-template').html()),

    // The DOM events specific to an item.
    events: {
        "click .toggle"   : "toggleDone",
        "dblclick .view"  : "edit",
        "click a.destroy" : "clear",
        "keypress .edit"  : "updateOnEnter",
        "blur .edit"      : "close"
    },

    // The TodoView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Todo** and a **TodoView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
        this.$form = this.$('#edit-practice-form');
        this.$properties = this.$('#edit-practice-properties');

        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
    },

    // Re-render the titles of the todo item.
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this.$el.toggleClass('done', this.model.get('done'));
        this.input = this.$('.edit');
        return this;
    },

    // Toggle the `"done"` state of the model.
    toggleDone: function() {
        this.model.toggle();
    },

    // Switch this view into `"editing"` mode, displaying the input field.
    edit: function() {
        this.$el.addClass("editing");
        this.input.focus();
    },

    // Close the `"editing"` mode, saving changes to the todo.
    close: function() {
        var value = this.input.val();
        if (!value) {
            this.clear();
        } else {
            this.model.save({title: value});
            this.$el.removeClass("editing");
        }
    },

    // If you hit `enter`, we're through editing the item.
    updateOnEnter: function(e) {
        if (e.keyCode == 13) this.close();
    },

    // Remove the item, destroy the model.
    clear: function() {
        this.model.destroy();
    }

});



/**
 * Individual Practice class
 */
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


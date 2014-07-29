/**
 * Practice has many Things. Things have one practice.
 */
var Thing = Backbone.Model.extend({

    // Default attributes for a Thing.
    defaults: function() {
        return {
            title: "empty todo...",
            order: Todos.nextOrder(),
            done: false
        }
    },

    toggle: function() {
        this.save({done: !this.get("done")})
    }

})

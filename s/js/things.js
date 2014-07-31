/**
 * Practice has many Things. Things have one practice.
 */
var Thing = Backbone.Model.extend({

    defaults: function() {
        return {
            name: ''
        }
    }

})

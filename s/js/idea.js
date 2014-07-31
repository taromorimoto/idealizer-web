
var Idea = function() {
}

Idea.prototype.init = function() {
    var self = this

    // Load all practices
    this.practices = new Idea.PracticeCollection
    this.initDfd = this.practices.fetch({reset: true})
}

Idea.prototype.renderPractices = function() {
    this.initDfd.done(function() {
        this.selectorView = new Idea.PracticeSelectorView({
            collection: this.practices
        })
        this.editPracticeView = new Idea.EditPracticeView({
            model: new Idea.Practice(),
            selectorView: this.selectorView
        })
    }.bind(this))
}

Idea.IdeaView = Backbone.View.extend({

    el: $("#idea-view"),

    events: {},

    initialize: function() {
        var self = this

        this.nav = this.$("nav")
        this.content = this.$(".content:first")

    },

    render: function() {

        return this
    }

})


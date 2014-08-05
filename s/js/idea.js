
var Idea = function() {
}


Idea.prototype.init = function() {
    var self = this

    _.extend(this, Backbone.Events);

    // Load all practices
    this.practices = new Idea.PracticeCollection()
    this.initDfd = this.practices.fetch({ reset: true })
}

Idea.prototype.renderPractices = function() {
    this.initDfd.done(function() {
        this.practices.unshift(new Idea.Practice)
        this.selectorView = new Idea.PracticeSelectorView({ collection: this.practices })

        this.editPracticeView = new Idea.EditPracticeView({ model: this.selectorView.selected() })

        this.listenTo(this.selectorView, 'select', this.editPracticeView.setModel.bind(this.editPracticeView))
        this.listenTo(this.editPracticeView, 'sync:new-model', function() {
            this.practices.unshift(new Idea.Practice)
        }.bind(this))

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



var Idea = function() {
}


Idea.prototype.init = function() {
    var self = this

    _.extend(this, Backbone.Events)

    Practices.loadPracticeSelectorView()
    this.loadPractices()
}

Idea.prototype.practiceName = function() {
    return this.practices.get($.cookie('practice_id')).get('name')
}

Idea.prototype.loadPractices = function() {
    Practices.loadModelCollection()
    this.practices = new Practices.PracticeCollection
    this.practicesDfd = this.practices.fetch({ reset: true })
}

Idea.prototype.renderEditPractices = function() {
    this.practicesDfd.done(function() {
        this.practices.unshift(new Practices.Practice)
        this.selectorView = new Practices.PracticeSelectorView({ el: '#edit-practice-selector', collection: this.practices, edit: true })

        this.editPracticeView = new Practices.EditPracticeView({ model: this.selectorView.selected() })

        this.listenTo(this.selectorView, 'select', this.editPracticeView.setModel.bind(this.editPracticeView))
        this.listenTo(this.editPracticeView, 'sync:new-model', function() {
            this.practices.unshift(new Practices.Practice)
        }.bind(this))

    }.bind(this))
}

Idea.prototype.renderPracticeSelector = function() {
    this.practicesDfd.done(function() {

        // Get currently selected practice from url or cookie
        var practiceId
        if (this.practices.length == 1) {
            practiceId = this.practices.at(0).id
        } else {
            var path = window.location.pathname.split('/')
            practiceId = path.length > 1 && !isNaN(path[1]) && path[1] || $.cookie('practice_id')
        }
        $.cookie('practice_id', practiceId)

        this.selectorView = new Practices.PracticeSelectorView({ collection: this.practices, selected: practiceId })

        this.listenTo(this.selectorView, 'select', function(model) {
            $.cookie("practice_id", model.id);
        })
    }.bind(this))
}

Idea.prototype.selectedPractice = function() {
    return this.practices.get($.cookie('practice_id'))
}

Idea.prototype.loadThings = function() {
    Things.loadModelCollection()
    Things.loadViews()
    this.things = new Things.ThingCollection
    this.thingsDfd = this.things.fetch({ reset: true })
}

Idea.prototype.renderThings = function() {
    this.thingsDfd.done(function() {
        this.thingsGridView = new Things.ThingsGridView({ collection: this.things })

    }.bind(this))
}


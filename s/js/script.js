

/**
 * Handler class for managing practices
 */
var Practices = function () {
    this.data = null
    this.$selector = null
}

Practices.prototype.init = function() {
    var self = this
    this.$selector = $('#idea-practice-selector')
    this.$form = $('#idea-practice-form')

    if (this.$selector.length > 0) {
        this.loadAll().done(function() {
            self.populateSelector()
            if (self.$form.length > 0) {
                self.initSaveForm()
            }
        })
    }
}

Practices.prototype.loadAll = function() {
    var dfd = $.Deferred()
    var self = this
    $.ajax({
        url: '/practices/all',
        dataType: "json",
        cache: false,
        success: function(data, textStatus, jqXHR) {
            if (typeof data.error === 'undefined') {
                console.log('Loaded all practices', data)
                self.data = data.practices
                dfd.resolve()
            } else {
                alert('ERRORS: ' + data.error)
                dfd.reject()
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('ERRORS: ' + textStatus)
            dfd.reject()
        }
    })
    return dfd.promise()
}

Practices.prototype.initSaveForm = function() {
    var self = this

    this.initSelectorForSaveForm()

    this.$form.off().submit(function(e) {
        e.preventDefault()
        e.stopPropagation()

        console.log('Saving Practice', self.practice.toJSON())
        self.$form.find('.idea-load-spin:last').show()

        $.ajax({
            url: '/practices/save',
            type: 'POST',
            data: { data: self.practice.stringify() },
            dataType: "json",
            cache: false
        })
        .done(function(data, textStatus, jqXHR) {
            if (typeof data.error === 'undefined' && data.practice && data.practice.key) {
                console.log('Saved practice', data)
                self.data[data.practice.key] = data.practice
                self.initSelector(data.practice.key)
            } else {
                alert('ERRORS: ' + data.error)
                console.error('SavePractice failed', textStatus)
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            alert('ERRORS: ' + textStatus)
            console.error('SavePractice failed', errorThrown)
        })
        .always(function() {
            self.$form.find('.idea-load-spin:last').hide()
        })

        return false
    })
}

Practices.prototype.deletePractice = function(key) {
    return $.ajax({
        url: '/practices/delete',
        data: { key: self.$selector.val() },
        dataType: "json",
        cache: false
    })
    .done(function(data, textStatus, jqXHR) {
        if (typeof data.error === 'undefined' && data.key) {
            console.log('Practice deleted', data)
            delete self.data[data.key]
            self.initSelector()
        } else {
            alert('ERRORS: ' + data.error)
            console.error('DeletePractice failed', textStatus)
        }
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        alert('ERRORS: ' + textStatus)
        console.error('DeletePractice failed', errorThrown)
    })
}

Practices.prototype.initSelectorForSaveForm = function(key) {
    var self = this

    this.populateSelector(key, true)

    this.selectPractice(key)

    this.$selector.change(function() {
        self.selectPractice($(this).val())
    })

    this.$form.find('.delete-practice').click(function() {
        self.$form.find('.idea-load-spin:first').show()

        self.deletePractice().always(function() {
            self.$form.find('.idea-load-spin:first').hide()
        })
    })
}

Practices.prototype.populateSelector = function(key, addNew) {
    var self = this

    self.$selector.off('change').empty()

    if (addNew)
        this.$selector.prepend('<option value="">Create new...</option>')

    if (this.data) {
        $.each(this.data, function(key, value) {
            self.$selector.append('<option value="' + key + '">' + value.name + '</option>')
        })
    }

    if (key) this.$selector.val(key)
}

Practices.prototype.selectPractice = function(key) {
    this.practice = new Practice(this.data[key], { $form: this.$form })
    this.$form.show()
}


/**
 * Main instance for Idealizer
 */
var idea = {
    init: function() {
        idea.img.init()
        idea.practices.init()
    },
    img: {
        init: function() {
            $('input[type=file]').on('change', idea.img.upload)
            console.log('idea.init')

            $('.idea-upload-controls button').click(function() {
                $('#idea-image-upload').click()
            })
        },
        upload: function(e) {
            console.log('idea.img.upload')

            // Create a formdata object and add the files
            var files = e.target.files
            var data = new FormData()
            $.each(files, function(key, value) {
                data.append('file', value)
                console.log('Uploading: ' + key + '=' + value)
            })

            // Upload            
            $.ajax({
                url: $(e.target).attr('upload_url'),
                type: 'POST',
                data: data,
                dataType: "json",
                cache: false,
                processData: false, // Don't process the files
                contentType: false, // Set content type to false as jQuery will tell the server its a query string request
                success: function(data, textStatus, jqXHR) {
                    $(e.target).attr('upload_url', data.upload_url)
                    if (typeof data.error === 'undefined') {
                        for (var i in data.files) {
                            var file = data.files[i]
                            console.log('Uploaded: ' + file.url)
                            idea.img.showUploaded(file.url, file.key)
                        }
                    } else {
                        alert('ERRORS: ' + data.error)
                    }
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert('ERRORS: ' + textStatus)
                }
            })
        },
        showUploaded: function(url, key) {

            var cont = $('<div class="idea-square-container"></div>')
            cont.attr('key', key)
            cont.css('background-image', 'url(' + url + ')')

            var wrap = $('<div class="idea-square-wrapper"></div>')
            var grid = $('<div class="pure-u-1-6"></div')
            grid.append(wrap.append(cont))
            $('#idea-image-uploads > :last-child').before(grid)
        }
    },
    practices: null,
    
    str: function(value, _default) {
        return value == undefined ? _default : value
    }
}



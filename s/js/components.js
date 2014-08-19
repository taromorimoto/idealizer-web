
var ImageUploadView = Backbone.View.extend({

    template: _.template($('#image-upload-template').html()),
    imageTemplate: _.template($('#uploaded-image-template').html()),

    events: {
        'change input[type=file]'            : 'upload',
        'click .idea-upload-controls button' : 'selectFiles'
    },

    initialize: function(options) {
        _.defaults(this, options, {
            cols: 5,
            max: 0
        })
        this.images = []
        this.render()
    },

    render: function() {
        console.log('ImageUploadView.render')
        this.$el.html(this.template({ cols: this.cols, max: this.max }))
        this.updateMaxCount()
        return this
    },

    upload: function(e) {
        var self = this
        var files = e.target.files
        if (this.max > 0 && this.max < _.size(this.images) + _.size(files)) {
            var elem = this.$('.idea-upload-controls')
            elem.removeClass('shake').width()
            elem.addClass('shake')
            this.$('.max-images').addClass('error')
            return
        } else {
            this.$('.error').removeClass('error')
            this.$('.idea-upload-controls').removeClass('shake')
        }

        var data = new FormData()
        $.each(files, function(key, value) {
            data.append('file', value)
            console.log('Uploading: ' + key + '=' + value)
        })
        this.spinner(true)

        $.ajax({
            url: $(e.target).attr('upload_url'),
            type: 'POST',
            data: data,
            dataType: "json",
            cache: false,
            processData: false, // Don't process the files
            contentType: false // Set content type to false as jQuery will tell the server its a query string request
        }).done(function(data, textStatus, jqXHR) {
            // Set a new server generated upload_url
            $(e.target).attr('upload_url', data.upload_url)

            for (var i in data.files) {
                var file = data.files[i]
                console.log('Uploaded: ' + file.url)
                self.showUploaded(file.url, file.key)
                self.images.push(file)
            }
            self.updateMaxCount()
        }).fail(function(jqXHR, textStatus, errorThrown) {
            alert('ERRORS: ' + textStatus)
        }).always(function() {
            self.spinner()
        })
    },

    showUploaded: function(url, key) {
        var image = $(this.imageTemplate({
            cols: this.cols,
            key: key,
            url: url
        }))
        this.$('.idea-image-uploads > :last-child').before(image)
    },

    updateMaxCount: function() {
        if (this.max > 0) {        
            this.$('.max-images').text('(max ' + (this.max - this.images.length) + ')')
        }
    },

    selectFiles: function() {
        this.$('.idea-image-upload').click()
    },

    spinner: function(show) {
        this.$('.idea-load-spin').toggle(show == true).prev().toggle(show != true)
    }

})



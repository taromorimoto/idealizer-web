/*jshint asi: true, supernew: true, jquery: true*/
/*globals window, console, alert, FormData, _, Backbone, Practices, idea, humanized_time_span */

var ImagesView = (function() {

"use strict";

return Backbone.View.extend({

    template: _.template($('#image-upload-template').html()),
    imageTemplate: _.template($('#uploaded-image-template').html()),

    events: {
        'change input[type=file]'       : 'upload',
        'click .upload-controls button' : 'selectFiles',
        'click .delete'                 : 'delete'
    },

    initialize: function(options) {
        _.defaults(this, options, {
            cols: 5,
            max: 0,
            images: []
        })

        this.fetchUploadUrl()
        this.render()
    },

    render: function() {
        console.log('ImagesView.render')
        this.$el.html(this.template({ cols: this.cols, max: this.max }))
        _.each(this.images, this.showUploaded.bind(this))

        this.updateMaxCount()
        return this
    },

    fetchUploadUrl: function() {
        var self = this
        $.get('/upload').done(function(data) {
            self.uploadUrl = data.upload_url
        }).fail(function() {
            console.log('Failed to fetch upload url')
        })
    },

    upload: function(e) {
        var self = this
        var files = e.target.files
        if (this.canUpload(_.size(files))) {
            this.$('.error').removeClass('error')
        } else {
            var elem = this.$('.upload-controls')
            elem.removeClass('shake').width()
            elem.addClass('shake')
            this.$('.max-images').addClass('error')
            return
        }

        var data = new FormData()
        $.each(files, function(blob_key, value) {
            data.append('file', value)
            console.log('Uploading: ' + blob_key + '=' + value)
        })
        this.spinner(true)

        $.ajax({
            url: this.uploadUrl,
            type: 'POST',
            data: data,
            dataType: "json",
            cache: false,
            processData: false, // Don't process the files
            contentType: false // Set content type to false as jQuery will tell the server its a query string request
        }).done(function(data, textStatus, jqXHR) {
            // Set a new server generated upload_url
            self.uploadUrl = data.upload_url

            for (var i in data.files) {
                var file = data.files[i]
                console.log('Uploaded: ' + file.url)
                self.showUploaded(file)
                self.images.push(file)
                self.trigger('change', self.images)
            }
            self.updateMaxCount()
        }).fail(function(jqXHR, textStatus, errorThrown) {
            alert('ERRORS: ' + textStatus)
        }).always(function() {
            self.spinner()
        })
    },

    json: function() {
        return _.clone(this.images)
    },

    showUploaded: function(img) {
        var image = $(this.imageTemplate({
            cols: this.cols,
            blob_key: img.blob_key,
            url: img.url
        }))
        this.$('.image-uploads > :last-child').before(image)
    },

    delete: function(e) {
        var images = this.$('.image-container')
        var index = images.index($(e.target).closest('.image-container'))
        this.images.splice(index, 1)
        images.eq(index).remove()
        this.updateMaxCount()
    },

    canUpload: function(count) {
        return this.max === 0 || this.uploadsLeft() - count >= 0
    },

    uploadsLeft: function() {
        return this.max === 0 ? Number.MAX_VALUE : this.max - this.images.length
    },

    updateMaxCount: function() {
        if (this.max > 0) {
            var left = this.uploadsLeft()
            this.$('.max-images').text('(max ' + left + ')')
            this.$('button').prop('disabled', left === 0)
        }
    },

    selectFiles: function() {
        this.$('input[type=file]').click()
    },

    spinner: function(show) {
        this.$('.load-spin').toggle(show === true).prev().toggle(show !== true)
    }

})

})()

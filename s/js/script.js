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



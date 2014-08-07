import os
import urllib

import webapp2

from things import *
from practices import *
from main_view import MainView
from image_handler import ImageUploader

application = webapp2.WSGIApplication([
    ('/', MainView),

    ('/upload', ImageUploader),

    ('/new', NewThingView),

    (r'/things/(\d+)', RESTThings),
    (r'/practices/?(\d*)', RESTPractices),

], debug=True)



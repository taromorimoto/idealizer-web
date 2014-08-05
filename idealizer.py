import os
import urllib

import webapp2
import jinja2

from views.thing_view import *
from views.practices import *
from views.main_view import MainView
from views.image_handler import ImageUploader

application = webapp2.WSGIApplication([
    ('/', MainView),

    ('/new', NewThingView),
    ('/create', NewThingView),
    (r'/thing/(\d+)', ThingView),

    ('/upload', ImageUploader),

    ('/practices', PracticesView),
    ('/practices/all', AllPractices),
    ('/practices/save', SavePractice),
    ('/practices/delete', DeletePractice),

    ('/practice', SavePractice),
    (r'/practice/(\d*)', SavePractice),

], debug=True)

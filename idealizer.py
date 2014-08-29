import os
import urllib

import webapp2

from things import *
from practices import *
from landing import *
from test.test import *
from image import ImageUploader

application = webapp2.WSGIApplication([
    ('/', Landing),

    ('/upload', ImageUploader),

    (r'/?(\d*)/things/?(\d*)', RESTThings),
    (r'/practices/?(\d*)', RESTPractices),

    (r'/test/(.+)', Test),
], debug=True)



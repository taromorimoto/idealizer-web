import webapp2, json

from google.appengine.api import users
from google.appengine.ext import ndb
from google.appengine.ext import blobstore

import helpers


class Test(helpers.RequestHandler):

    def get(self, template_name):
        template = helpers.get_template('/test/' + template_name)
        
        self.respond_html()
        self.response.write(template.render({
            'upload_url': blobstore.create_upload_url('/upload')
        }))

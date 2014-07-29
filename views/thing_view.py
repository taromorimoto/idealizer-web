import os
import urllib

import webapp2
import jinja2

from google.appengine.ext import ndb

from google.appengine.ext import blobstore

from thing import Thing

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

thing_template = JINJA_ENVIRONMENT.get_template('thing.html')
new_thing_template = JINJA_ENVIRONMENT.get_template('new_thing.html')

class ThingView(webapp2.RequestHandler):

    def get(self, thing_id):
        thing_id = int(thing_id)
        self.response.headers['Content-Type'] = 'text/html'

        thing = Thing.get_by_id(thing_id)

        template_values = {}
        template_values['thing'] = thing.values()
        self.response.write(thing_template.render(template_values))

class NewThingView(webapp2.RequestHandler):

    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
        values = {
            'upload_url': blobstore.create_upload_url('/upload')
        }
        self.response.write(new_thing_template.render(values))

    def post(self):
        thing = Thing()
        thing.name = self.request.get('name')
        thing.description = self.request.get('description')
        thing.image = ndb.Blob(self.request.get('image'))
        thing.put()
        print 'redirecting...'
        self.redirect('/thing/' + str(thing.key.id()))


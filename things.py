import jinja2, os, webapp2

from google.appengine.api import users
from google.appengine.ext import ndb

from google.appengine.ext import blobstore

import helpers


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)


thing_template = JINJA_ENVIRONMENT.get_template('thing.html')
new_thing_template = JINJA_ENVIRONMENT.get_template('new_thing.html')


class ThingProperty(ndb.Expando):
	name = ndb.StringProperty()
	type = ndb.StringProperty()
	thing = ndb.KeyProperty(kind='Thing')

	@classmethod
	def decode(cls, data):
		obj = cls()
		obj.name = data['name']
		obj.type = data['type']
		return obj

	def json(self):
		return {
			'key': self.key.id() if self.key else '',
			'name': self.name,
			'type': self.type,
		}

class Thing(ndb.Model):
	author = ndb.UserProperty()
	name = ndb.StringProperty()
	properties = ndb.KeyProperty(kind='ThingProperty', repeated=True)
	date = ndb.DateTimeProperty(auto_now_add=True)

	@staticmethod
	def all():
		things_query = Thing.query().order(-Thing.date)
		return things_query.fetch(50)

	def json(self):
		return {
			'key': self.key,
			'name': self.name,
			'date': self.date,
			'properties': [p.get().json() for p in self.properties],
		}

class RESTThings(helpers.RequestHandler):

    def get(self, id):
        id = int(id)

        thing = Thing.get_by_id(id)

        template_values = {}
        template_values['thing'] = thing.values()

        self.respond_html()
        self.response.write(thing_template.render(template_values))

    def post(self, id):
        print 'RESTThings (NEW):', self.request.body
        thing = Thing()
        thing.name = self.request.get('name')
        thing.description = self.request.get('description')
        thing.image = ndb.Blob(self.request.get('image'))
        thing.put()

        self.respond_json()
        self.response.out.write(json.dumps({
            'id': thing.key.id()
        }))


class NewThingView(webapp2.RequestHandler):

    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
        values = {
            'upload_url': blobstore.create_upload_url('/upload')
        }
        self.response.write(new_thing_template.render(values))


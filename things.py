import webapp2, json

from google.appengine.api import users
from google.appengine.ext import ndb

import helpers

things_template = helpers.get_template('things.html')

class ThingProperty(ndb.Expando):
	name = ndb.StringProperty()
	type = ndb.StringProperty()
	thing = ndb.KeyProperty(kind='Thing')
	size = ndb.IntegerProperty(default=1) # 0 = unlimited list, 1 = singular, > 1 = list with size

	@classmethod
	def decode(cls, data):
		obj = cls()
		obj.name = data['name']
		obj.type = data['type']
		obj.size = data['size']
		return obj

	def json(self):
		return {
			'key': self.key.id() if self.key else '',
			'name': self.name,
			'type': self.type,
			'size': self.size,
		}

class Thing(ndb.Model):
	author = ndb.UserProperty()
	name = ndb.StringProperty()
	properties = ndb.KeyProperty(kind='ThingProperty', repeated=True)
	date = ndb.DateTimeProperty(auto_now_add=True)

	@staticmethod
	def all(practice_key=None):
		things_query = Thing.query(ancestor=practice_key).order(-Thing.date)
		return things_query.fetch(50)

	def json(self):
		return {
			'key': self.key,
			'name': self.name,
			'date': self.date,
			'properties': [p.get().json() for p in self.properties],
		}

class RESTThings(helpers.RequestHandler):

    def get(self, practice_id, id):
        practice_id = practice_id if practice_id else self.request.cookies.get('practice_id')
        print "practice_id=" + str(practice_id)

    	# Get html page with things
        if self.accepts_html() and not id:
            self.respond_html()
            self.response.write(things_template.render())
            return

        # Get one thing json
        if id:
	        thing = Thing.get_by_id(int(id))
	        self.respond_json()
	        self.response.out.write(json.dumps(thing))

        # Get all things json
        self.respond_html()
        print Thing.all()
        self.response.write(json.dumps([thing.json() for thing in Thing.all()]))

    def post(self, practice_id, id):
        practice_id = practice_id if practice_id else self.request.cookies.get('practice_id')
        print 'RESTThings (NEW):', self.request.body

        thing = Thing(ancestor=practice_id)
        thing.name = self.request.get('name')
        thing.description = self.request.get('description')
        thing.image = ndb.Blob(self.request.get('image'))
        thing.put()

        self.respond_json()
        self.response.out.write(json.dumps({
            'id': thing.key.id()
        }))



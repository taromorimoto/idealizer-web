from google.appengine.api import users
from google.appengine.ext import ndb

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

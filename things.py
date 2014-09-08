import webapp2, json, time

from google.appengine.api import users
from google.appengine.ext import ndb

import helpers
from image import Image

things_template = helpers.get_template('things.html')

class ThingProperty(ndb.Expando):
    name = ndb.StringProperty(indexed=False)
    type = ndb.StringProperty(default='text', indexed=False)
    size = ndb.IntegerProperty(default=1, indexed=False) # 0 = unlimited list, 1 = singular, > 1 = list with size

    @classmethod
    def create(cls, data, parent_key=None):
        obj = cls(parent=parent_key)
        obj.name = data['name']
        obj.type = data['type']
        obj.size = data['size']
        obj.decode_value(data['value'])
        return obj

    @classmethod
    def get_and_update_value(cls, parent_key, data):
    	print data['key']
    	print parent_key
        obj = cls.get_by_id(data['key'], parent=parent_key)
        print obj
        obj.decode_value(data['value'])
        return obj

    def decode_value(self, value):
        if value:
            if self.type == 'image':
                self.value = json.dumps(value)
            elif self.type == 'text' and self.size > 1:
                self.value = [v or u'' for v in value]
            else:
                self.value = value

    def json(self):
        values = {
            'key': self.key.id() if self.key else '',
            'name': self.name,
            'type': self.type,
            'size': self.size,
        }
        if hasattr(self, 'value'):
            if self.type == 'image':
                values['value'] = json.loads(self.value)
            else:
                values['value'] = self.value
        return values

class Thing(ndb.Model):
    author = ndb.UserProperty()
    name = ndb.StringProperty()
    properties = ndb.KeyProperty(kind='ThingProperty', repeated=True)
    date = ndb.DateTimeProperty(auto_now_add=True)

    @staticmethod
    def all(practice_key=None):
        things_query = Thing.query(ancestor=practice_key).order(-Thing.date)
        return things_query.fetch(50)

    @classmethod
    def create_and_put(cls, practice_id, data):
        obj = cls(parent = ndb.Key('Practice', practice_id))
        obj.name = data['name']
        obj.put()
        obj.properties = ndb.put_multi([ThingProperty.create(p, obj.key) for p in data['properties']])
        #obj.properties = [ThingProperty.create(p) for p in data['properties']]
        obj.put()
        return obj

    def decode_and_put(self, data):
        self.name = data['name']
        # Optimize this with get_multi and checking a dirty flag for changed properties
        entities = [ThingProperty.get_and_update_value(self.key, prop) for prop in data['properties']]
        self.properties = ndb.put_multi(entities)
        self.put()

    def json_properties(self):
        props = ndb.get_multi(self.properties)
        return [p.json() for p in props]

    def json(self):
        return {
            'key': self.key.id(),
            'parent': self.key.parent().id(),
            'name': self.name,
            'date': time.mktime(self.date.timetuple()) * 1000,
            'properties': self.json_properties(),
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
        self.respond_json()
        thing_json = [thing.json() for thing in Thing.all()]
        print thing_json
        self.response.write(json.dumps(thing_json))

    def post(self, practice_id, id):
        practice_id = int(practice_id if practice_id else self.request.cookies.get('practice_id'))
        print 'RESTThings (NEW):', self.request.body

        thing = Thing.create_and_put(practice_id, json.loads(self.request.body))

        self.respond_json()
        self.response.out.write(json.dumps({
            'id': thing.key.id()
        }))

    def put(self, practice_id, id):
        practice_id = int(practice_id if practice_id else self.request.cookies.get('practice_id'))
        id = int(id)
        print 'RESTThings (UPDATE):', self.request.body
        thing = Thing.get_by_id(id, parent=ndb.Key('Practice', practice_id))
        thing.decode_and_put(json.loads(self.request.body))

        self.respond_json()
        self.response.out.write(json.dumps({
            'id': id
        }))

    def delete(self, practice_id, id):
        practice_id = int(practice_id if practice_id else self.request.cookies.get('practice_id'))
        id = int(id)
        print 'RESTThings (DELETE):', id, practice_id
        thing = Thing.get_by_id(id, parent=ndb.Key('Practice', practice_id))
        ndb.delete_multi(thing.properties)
        thing.key.delete()

        self.respond_json()
        self.response.out.write(json.dumps({
            'id': id
        }))


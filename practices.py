import webapp2
import json

from google.appengine.ext import ndb
from google.appengine.ext import blobstore

from things import ThingProperty
from image import Image
import helpers

template = helpers.get_template('practices.html')

class Practice(ndb.Model):
    author = ndb.UserProperty()
    name = ndb.StringProperty()
    img = ndb.StructuredProperty(Image)
    properties = ndb.StructuredProperty(ThingProperty, repeated=True)
    date = ndb.DateTimeProperty(auto_now_add=True)

    @staticmethod
    def all():
        query = Practice.query().order(-Practice.date)
        return query.fetch(100)

    @classmethod
    def create(cls, data):
        obj = cls()
        if data.has_key('img'):
            obj.img = Image.create(data['img'])
        obj.name = data['name']
        obj.properties = [ThingProperty.decode(prop) for prop in data['properties']]
        return obj

    def decode(self, data):
        self.name = data['name']
        if data.has_key('img'):
            self.img = Image.create(data['img'])
        else:
            self.img = None
        self.properties = [ThingProperty.decode(prop) for prop in data['properties']]

    def json(self):
        values = {
            'key': self.key.id(),
            'name': self.name,
            'properties': [p.json() for p in self.properties]
        }
        if self.img:
            values['img'] = {
                'blob_key': self.img.blob_key,
                'url': self.img.url,
            }

        return values

class RESTPractices(helpers.RequestHandler):

    def get(self, id):
        if self.accepts_html():
            self.respond_html()
            self.response.write(template.render())
            return

        values = []
        practices = Practice.all()
        for practice in practices:
            values.append(practice.json())

        self.respond_json()
        self.response.out.write(json.dumps(values))

    def post(self, id):
        print 'RESTPractices (NEW):', self.request.body
        practice = Practice.create(json.loads(self.request.body))
        practice.put()

        self.respond_json()
        self.response.out.write(json.dumps({
            'id': practice.key.id()
        }))

    def put(self, id):
        print 'RESTPractices (UPDATE):', self.request.body
        practice = Practice.get_by_id(int(id))
        practice.decode(json.loads(self.request.body))
        practice.put()

        self.respond_json()
        self.response.out.write(json.dumps({
            'id': id
        }))

    def delete(self, id):
        print 'RESTPractices (DELETE):', self.request.body
        practice = Practice.get_by_id(int(id))
        practice.key.delete()

        self.respond_json()
        self.response.out.write(json.dumps({
            'id': id
        }))



import os
import urllib
import webapp2
import jinja2
import json

from google.appengine.ext import ndb
from google.appengine.ext import blobstore

from thing import ThingProperty


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

template = JINJA_ENVIRONMENT.get_template('practices.html')


class Practice(ndb.Model):
    author = ndb.UserProperty()
    name = ndb.StringProperty()
    properties = ndb.StructuredProperty(ThingProperty, repeated=True)
    date = ndb.DateTimeProperty(auto_now_add=True)

    @staticmethod
    def all():
        query = Practice.query().order(-Practice.date)
        return query.fetch(100)

    @classmethod
    def create(cls, data):
        obj = cls()
        obj.name = data['name']
        obj.properties = [ThingProperty.decode(prop) for prop in data['properties']]
        return obj

    def decode(self, data):
        self.name = data['name']
        self.properties = [ThingProperty.decode(prop) for prop in data['properties']]

    def json(self):
        return {
            'key': self.key.id(),
            'name': self.name,
            'properties': [p.json() for p in self.properties]
        }

class IdeaHTMLHandler(webapp2.RequestHandler):

    def r(self, key):
        return self.request.get(key)

    def set_headers(self):
        self.response.headers['Content-Type'] = 'text/html'

class IdeaJSONHandler(webapp2.RequestHandler):

    def r(self, key):
        return self.request.get(key)

    def set_headers(self):
        self.response.headers['Content-Type'] = 'application/json'

class PracticesView(IdeaHTMLHandler):

    def get(self):
        self.set_headers()
        self.response.write(template.render())

class AllPractices(IdeaJSONHandler):

    def get(self):
        self.set_headers()

        values = []
        practices = Practice.all()
        for practice in practices:
            values.append(practice.json())

        print values
        self.response.out.write(json.dumps(values))

class SavePractice(IdeaJSONHandler):

    def post(self):
        self.set_headers()

        print 'SavePractice (NEW):', self.request.body
        practice = Practice.create(json.loads(self.request.body))
        practice.put()

        self.response.out.write(json.dumps({
            'id': practice.key.id()
        }))

    def put(self, id):
        self.set_headers()

        print 'SavePractice:', self.request.body
        practice = Practice.get_by_id(int(id))
        practice.decode(json.loads(self.request.body))
        practice.put()

        self.response.out.write(json.dumps({
            'id': practice.key.id()
        }))


class DeletePractice(IdeaJSONHandler):

    def get(self):
        self.set_headers()

        key = int(self.request.get('key'))
        print 'Deleting practice %d' % key

        ndb.Key(Practice, key).delete()

        self.response.out.write(json.dumps({
            'status': 'success',
            'key': key,
        }))


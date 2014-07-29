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

        values = {}
        practices = Practice.all()
        for practice in practices:
            values[practice.key.id()] = practice.json()

        self.response.out.write(json.dumps({
            'practices': values
        }))

class SavePractice(IdeaJSONHandler):

    def post(self):
        self.set_headers()

        data = json.loads(self.request.get('data'))
        print 'SavePractice:', data

        key = data['key']
        if key:
            practice = Practice.get_by_id(key)
        else:
            practice = Practice()

        practice.name = data['name']
        practice.properties = []

        for p in data['properties']:
            prop = ThingProperty(name = p['name'], type = p['type'])
            practice.properties.append(prop)

        practice.put()

        self.response.out.write(json.dumps({
            'status': 'success',
            'practice': practice.json(),
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


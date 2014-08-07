import os
import urllib

import webapp2
import jinja2

from things import Thing

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

template = JINJA_ENVIRONMENT.get_template('main.html')

template_values = {}

class MainView(webapp2.RequestHandler):

    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
        template_values['things'] = Thing.all()
        self.response.write(template.render(template_values))



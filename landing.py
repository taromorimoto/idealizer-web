import webapp2

from google.appengine.api import users

import helpers

template = helpers.get_template('landing.html')

class Landing(helpers.RequestHandler):

    def get(self):
        self.respond_html()
        self.response.write(template.render())

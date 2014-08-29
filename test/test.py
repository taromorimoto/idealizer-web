import webapp2, json

from google.appengine.api import users

import helpers


class Test(helpers.RequestHandler):

    def get(self, template_name):
        template = helpers.get_template('/test/' + template_name)
        
        self.respond_html()
        self.response.write(template.render())


import webapp2


class RequestHandler(webapp2.RequestHandler):

    def r(self, key):
        return self.request.get(key)

    def respond_html(self):
        self.response.headers['Content-Type'] = 'text/html'

    def respond_json(self):
        self.response.headers['Content-Type'] = 'application/json'

    def accepts_json(self):
        return self.request.headers['Accept'].find('application/json') > -1

    def accepts_html(self):
        return self.request.headers['Accept'].find('text/html') > -1



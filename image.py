import os
import urllib
import webapp2
import json

from google.appengine.ext import ndb
from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.api import images


class Image(ndb.Model):
    blob_key = ndb.StringProperty()
    url = ndb.StringProperty()

    @classmethod
    def create(cls, data):
        obj = cls()
        if data['blob_key']:
            obj.blob_key = data['blob_key']
        if data['url']:
            obj.url = data['url']
        return obj



class ImageUploader(blobstore_handlers.BlobstoreUploadHandler):
  def get(self):
    self.response.headers['Content-Type'] = 'application/json'   
    self.response.out.write(json.dumps({
        'upload_url': blobstore.create_upload_url('/upload'),
    }))

  def post(self):
    files = []

    upload_files = self.get_uploads()
    for blob_info in upload_files:
        #img = images.Image(blob_key = blob_info.key())
        files.append({
            'url': images.get_serving_url(blob_info.key()),
            'blob_key': str(blob_info.key()),
        })

    self.response.headers['Content-Type'] = 'application/json'   
    self.response.out.write(json.dumps({
        'files': files,
        'upload_url': blobstore.create_upload_url('/upload'),
    }))

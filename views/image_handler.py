import os
import urllib
import webapp2
import json

from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers
from google.appengine.api import images

class ImageUploader(blobstore_handlers.BlobstoreUploadHandler):
  def post(self):
    files = []

    upload_files = self.get_uploads()
    for blob_info in upload_files:
        #img = images.Image(blob_key = blob_info.key())
        files.append({
            'url': images.get_serving_url(blob_info.key()),
            'key': str(blob_info.key()),
        })

    self.response.headers['Content-Type'] = 'application/json'   
    self.response.out.write(json.dumps({
        'files': files,
        'upload_url': blobstore.create_upload_url('/upload'),
    }))

// # Local File System Image Storage module
// The (default) module for storing images, using the local file system

var util = require('util'),
    Promise = require('bluebird'),
    errors = require('../../core/server/errors'),
    BaseStore = require('../../core/server/storage/base'),
    storage = require('@google-cloud/storage');

function GhostGS(config) {
    BaseStore.call(this);

    var googleCloudService = storage({
      projectId: config.projectId,
      keyFilename: config.keyFilename
    });

    this.config = config;
    this.config.hostname = this.config.hostname || 'https://' + this.config.bucket + '.storage.googleapis.com/';
    this.bucket = googleCloudService.bucket(this.config.bucket);
    this.bucket.acl.default.add({
      entity: 'allUsers',
      role: googleCloudService.acl.OWNER_ROLE
    }, function(error, aclObject) {
      if (error) {
        errors.logError(error);
        return Promise.reject(error);
      }
    });
}

util.inherits(GhostGS, BaseStore);

GhostGS.prototype.save = function (image, targetDir) {
  var self = this,
      targetFileName;

  targetDir = targetDir || this.getTargetDir();

  return this.getUniqueFileName(this, image, targetDir)
  .then(function(filename) {
    targetFileName = filename;
    var options = {
      destination: filename
    };
    return new Promise(function(resolve, reject) {
      self.bucket.upload(image.path, options, function(error, response) {
        if (error) reject(error);
        resolve(response);
      });
    });
  })
  .then(function() {
    return self.config.hostname + targetDir + targetFilename;
  })
  .catch(function(e) {
    errors.logError(e);
    return Promise.reject(e);
  });
};

GhostGS.prototype.exists = function (fileName) {
  var file = this.bucket.file(fileName);
  return new Promise(function(resolve, reject) {
    file.exists(function(error, resp) {
      if (error) reject(error);
      resolve(resp);
    });
  });
};

// no-op so we just skip
GhostGS.prototype.serve = function () {
  return function (req, res, next) {
    next();
  };
};

GhostGS.prototype.delete = function (fileName) {
  var file = this.bucket.file(fileName);
  return new Promise(function(resolve, reject) {
    file.delete(function(error, resp) {
      if (error) reject(error);
      resolve(resp);
    });
  });
};

module.exports = GhostGS;

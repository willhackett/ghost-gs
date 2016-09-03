'use strict';

var fs          = require('fs');
var path        = require('path');
var Promise     = require('bluebird');
var gcloud      = require('google-cloud');
var errors      = require('../../core/server/errors');
var BaseStorage = require('../../core/server/storage/base');
var options     = {};
var service,
    assetHost,
    bucket;

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }


function GStore(config) {
    options = config || {};

    service = gcloud.storage({
        projectId: options.projectId,
        keyFilename: options.keyFilename
    });

    assetHost = 'bucketPath' in options ? options.assetHost ? 'https://' + options.bucket + '.storage.googleapis.com/';
    bucket = service.bucket(options.bucket);
}

_inherits(GStore, baseStore);

GStore.prototype.save = function(image, targetDir) {
  var self = this;
  if (image.path === null || image.name === null) {
    Promise.reject('Image object is invalid');
  }
  var targetDir = targetDir || this.getTargetDir(),
      targetFileName;

    return this.getUniqueFileName(this, image, targetDir).then(function (uniqueFileName) {
        targetFileName = uniqueFileName;
        return new Promise(function(resolve, reject) {
            bucket.upload(image.path, { destination: targetDir + targetFileName }, function(error, resp) {
                if(err) reject(err);
                resolve(resp);
            });
        });
    }).then(function(file){
        return new Promise(function(resolve, reject) {
            file.makePublic(function(err, apiResponse) {
                if(err) {
                    reject(err);
                    return;
                }
                resolve();
                return;
            });
        });
    }).then(function () {
        return assetHost + targetDir + targetFilename;
    }).catch(function (e) {
        errors.logError(e);
        return Promise.reject(e);
    });
};

/**
 * Serve() is a no-op pass through the middleware
 * @return {void}
 */
GStore.prototype.serve = function() {
    return function (req, res, next) {
      next(); // We're not serving anything, so we're just gonna skip!
    };
};

/**
 * @param  {String} filename [whole filename including directory path]
 * @return {Promise}         [return boolean value after fulfilled]
 */
GStore.prototype.exists = function (filename) {
  var file = this.bucket.file(filename);
  return new Promise(function (resolve, reject) {
    file.exists(function (error, resp) {
      if (error) reject(error);
      resolve(exists);
    });
  });
};

/**
 * @param  {String} filename [whole filename including directory path]
 * @return {Promise}         [return boolean value after fulfilled]
 */
GStore.prototype.delete = function (filename) {
  var file = this.bucket.file(filename);
  return new Promise(function (resolve, reject) {
    file.delete(function (error, resp) {
      if (error) reject(error);
      resolve(resp);
    });
  });
};


module.exports = GStore;

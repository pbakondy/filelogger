/*!
 * fileLogger
 * Copyright 2015 Peter Bakondy https://github.com/pbakondy
 * See LICENSE in this repository for license information
 */
(function(){
/* global angular, console */

// install   :     cordova plugin add org.apache.cordova.file

angular.module('fileLogger', ['ngCordova'])

  .factory('$fileLogger', ['$q', '$window', '$cordovaFile', '$timeout', function ($q, $window, $cordovaFile, $timeout) {
    'use strict';


    var queue = [];
    var ongoing = false;
    var levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];

    var storageFilename = 'messages.log';


    function log(level) {
      if (angular.isString(level)) {
        level = level.toUpperCase();

        if (levels.indexOf(level) === -1) {
          level = 'INFO';
        }
      } else {
        level = 'INFO';
      }

      var timestamp = (new Date()).toJSON();

      var messages = Array.prototype.slice.call(arguments, 1);
      var message = [ timestamp, level ];

      for (var i = 0; i < messages.length; i++ ) {
        if (angular.isArray(messages[i])) {
          message.push(JSON.stringify(messages[i]));
        }
        else if (angular.isObject(messages[i])) {
          message.push(JSON.stringify(messages[i]));
        }
        else {
          message.push(messages[i]);
        }
      }

      messages.unshift(timestamp);

      if (angular.isObject(console) && angular.isFunction(console.log)) {
        switch (level) {
          case 'DEBUG':
            if (angular.isFunction(console.debug)) {
              console.debug.apply(console, messages);
            } else {
              console.log.apply(console, messages);
            }
            break;
          case 'INFO':
            if (angular.isFunction(console.debug)) {
              console.info.apply(console, messages);
            } else {
              console.log.apply(console, messages);
            }
            break;
          case 'WARN':
            if (angular.isFunction(console.debug)) {
              console.warn.apply(console, messages);
            } else {
              console.log.apply(console, messages);
            }
            break;
          case 'ERROR':
            if (angular.isFunction(console.debug)) {
              console.error.apply(console, messages);
            } else {
              console.log.apply(console, messages);
            }
            break;
          default:
            console.log.apply(console, messages);
        }
      }

      queue.push({ message: message.join(' ') + '\n' });

      if (!ongoing) {
        process();
      }
    }


    function process() {

      if (!queue.length) {
        ongoing = false;
        return;
      }

      ongoing = true;
      var m = queue.shift();

      writeLog(m.message).then(
        function() {
          $timeout(function() {
            process();
          });
        },
        function() {
          $timeout(function() {
            process();
          });
        }
      );

    }


    function writeLog(message) {
      var q = $q.defer();

      if (!$window.cordova) {
        // running in browser with 'ionic serve'

        if (!$window.localStorage[storageFilename]) {
          $window.localStorage[storageFilename] = '';
        }

        $window.localStorage[storageFilename] += message;
        q.resolve();

      } else {

        $cordovaFile.writeFile(storageFilename, message, { append: true }).then(
          function() {
            q.resolve();
          },
          function(error) {
            q.reject(error);
          }
        );

      }

      return q.promise;
    }


    function getLogfile() {
      var q = $q.defer();

      if (!$window.cordova) {
        q.resolve($window.localStorage[storageFilename]);
      } else {
        $cordovaFile.readAsText(storageFilename).then(
          function(result) {
            q.resolve(result);
          },
          function(error) {
            q.reject(error);
          }
        );
      }

      return q.promise;
    }


    function deleteLogfile() {
      var q = $q.defer();

      if (!$window.cordova) {
        $window.localStorage.removeItem(storageFilename);
        q.resolve();
      } else {
        $cordovaFile.removeFile(storageFilename).then(
          function(result) {
            q.resolve(result);
          },
          function(error) {
            q.reject(error);
          }
        );
      }

      return q.promise;
    }


    function setStorageFilename(filename) {
      if (angular.isString(filename) && filename.length > 0) {
        storageFilename = filename;
        return true;
      } else {
        return false;
      }
    }


    return {
      log: log,
      getLogfile: getLogfile,
      deleteLogfile: deleteLogfile,
      setStorageFilename: setStorageFilename
    };

  }]);

})();
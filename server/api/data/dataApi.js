'use strict';
let dataStoreLibrary = require('./datastore.js');

function postDeleteAsPromise(requestKeys) {
  return new Promise(function (resolve, reject) {
    dataStoreLibrary.softDelete(requestKeys).then(function (data) {
      resolve({
        data: data
      });
    }).catch(function (err) {

      if (err.code === dataStoreLibrary.statusCodes.notFound) {
        reject(err);
      } else {
        reject(err);
      }
    });
  });
}

function getSettingsAsPromise(requestKeys, isSite) {
  return new Promise(function (resolve, reject) {
    dataStoreLibrary.read(requestKeys, isSite).then(function (data) {
      resolve({
        settings: data.settings,
        "first": false
      });
    }).catch(function (err) {
      if (err.code === dataStoreLibrary.statusCodes.notFound) {
        let data = {
          'settings': defaultSettings
        };

        addNewRecord(requestKeys, data).then(function (data) {
          resolve(data);
        }).catch(function (error) {
          throw error;
        });
      } else {
        reject(err);
      }
    });
  });
}

function addNewRecord(keyParts, data, isSite) {
  return new Promise(function (resolve, reject) {
    dataStoreLibrary.update(keyParts, data, isSite).then(function (savedData) {
      resolve({
        settings: savedData.settings,
        "first": true
      });
    }).catch(function (updateError) {
      reject(updateError);
    });
  });
}

function postSettings(keyParts, data, isSite) {
  return new Promise(function (resolve, reject) {
    dataStoreLibrary.update(keyParts, data, isSite).then(function (savedData) {
      resolve({settings: savedData.settings});
    }).catch(function (err) {
      reject(err);
    });

  });
}


module.exports = {
  postSettings,
  getSettingsAsPromise,
  postDeleteAsPromise
};

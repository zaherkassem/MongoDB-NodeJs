'use strict';
let config = require('../../config');
// Retrieve
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect("mongodb://localhost:27017/wix_google_calendar", function(err, db) {
  if(!err) {
    dbCon = db;
    console.log("We are connected");
  }else{
    console.log("connecte to db err:",err);
  }
});

let tableSettings = "settings";
let base64 = require('base64-coder-node')();
let enableBlob = true;
let entities = [];
let dbCon = "";

MongoClient.connect("mongodb://localhost:27017/wix_google_calendar", function(err, db) {
  if(!err) {
    dbCon = db;
    console.log("We are connected");
  }else{
    console.log("connecte to db err:",err);
  }
});

let dataStoreLibrary = {
  DB: function () {
    return dbCon;
  },
  statusCodes: {
    notFound: 404
  },
  getComponentUniqueId: function (keyParts) {
    return `${keyParts.instanceId}_${keyParts.compId}` || 'demo';
  },
  generateKey: function (arrKeys, isSite) {
    let componentUniqueId = this.getComponentUniqueId(arrKeys);
    let tableName = Boolean(isSite) ? tablePublished : tableEditor;
    return dataStore.key([tableName, componentUniqueId]);
  },
  transaction: function () {
    return dataStore.transaction();
  },
  read: function (keyParts, isSite) {
    let that = this;
    return new Promise(function (resolve, reject) {
      let key = that.generateKey(keyParts, isSite);
      let transaction = dataStoreLibrary.transaction();
      transaction.get(key, function (err, entity) {
        if (err) {
          reject(err);
        }

        if (!entity) {
          reject({
            code: dataStoreLibrary.statusCodes.notFound,
            message: 'Not found'
          });
        } else {
          if (entity.deleted) { //remove deleted key after undo
            let entityToSave = {
              key: key,
              data: [{name: 'settings', value: entity.settings, excludeFromIndexes: true}],
            };
            dataStore.save(entityToSave);
          }
          let settings;
          if (enableBlob) {
            try {
              if (typeof Buffer.from === "function") {
                let buf;
                buf = new Buffer.from(entity.settings, 'base64');
                settings = JSON.parse(buf.toString());
              }
            } catch (err) {
              resolve(entity);
              return;
            }
          } else {
            settings = entity;
          }
          resolve(settings);
        }
      });
    });
  },
  delete: function (keyParts) {
    let keySite = dataStoreLibrary.generateKey(keyParts, true);
    let keyEditor = dataStoreLibrary.generateKey(keyParts, false);
    return new Promise(function (resolve, reject) {
      dataStore.delete(
        [keySite, keyEditor],
        function (err) {
          if (!err) resolve(keyParts);
          else reject(err);
        }
      );
    });
  }, softDelete: function (keyParts) {
    let keySite = dataStoreLibrary.generateKey(keyParts, true);
    let keyEditor = dataStoreLibrary.generateKey(keyParts, false);
    return new Promise(function (resolve, reject) {
      try {
        let transaction = dataStoreLibrary.transaction();

        transaction.get([keyEditor, keySite], function (err, data) {
          if (err) {
            reject(err);
          } else {
            if (data) {
              let editorData, siteData, entity = [];
              let editorSettings = data[0] != null ? data[0].settings : null;
              let siteSettings = data[1] != null ? data[1].settings : null;

              if (editorSettings != null) {
                editorData = [{name: 'settings', value: editorSettings, excludeFromIndexes: true},
                  {name: 'deleted', value: new Date(), excludeFromIndexes: true}];
                entity.push({key: keyEditor, data: editorData});
              }

              if (siteSettings != null) {
                siteData = [{name: 'settings', value: editorSettings, excludeFromIndexes: true},
                  {name: 'deleted', value: new Date(), excludeFromIndexes: true}];
                entity.push({key: keySite, data: siteData});
              }
              if (entity.length !== 0) {
                dataStore.save(entity);
              }
            }
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  },
  update: function (keyParts, data, isSite) {

    let key = dataStoreLibrary.generateKey(keyParts, isSite);
    let dbData = {};
    if (enableBlob) {
      let items = JSON.stringify(data);
      let base64 = new Buffer.from(items).toString('base64');
      dbData = [{name: 'settings', value: base64, excludeFromIndexes: true}];
    } else {
      dbData.settings = data;
    }

    let entity = {
      key: key,
      data: dbData
    };

    return new Promise(function (resolve, reject) {
      dataStore.save(
        entity,
        function (err) {
          if (!err) {
            resolve(data);
          } else {
            reject(err);
          }
        }
      );
    });
  }
};

module.exports = dataStoreLibrary;

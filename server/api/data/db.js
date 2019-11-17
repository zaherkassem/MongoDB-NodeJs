const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'wix_google_calendar';
const tblSource = "settings";
const tblTarget = "settingsNew";
let DBCon = "";

let mongoDBLibrary = {
    statusCodes: {
        notFound: 404
    },
    delete: function(filter, callback){
        return new Promise(function (resolve, reject) {
            MongoClient.connect(url, {useUnifiedTopology: true}, function (err, client) {
                // Get the documents collection
                const collection = client.db(dbName).collection(tblSource);
                var cnt = collection.deleteMany(filter);
                client.close();
                resolve(cnt);
                callback(cnt);
            });
        });
    },
    findAll: function (filter, callback) {
        let that = this;
        return new Promise(function (resolve, reject) {
            MongoClient.connect(url,  { useUnifiedTopology: true } ,function (err, client) {
                // Get the documents collection
                let collection = client.db(dbName).collection(tblSource);
                // Find some documents

                collection.find(filter).limit(10000).toArray(function (err, docs) {
                    assert.equal(err, null);
                    docs.forEach(function(item) {
                        console.log("item:", item.compId);
                    });
                    client.close();
                    console.log("disconnect db server");
                    callback(docs);
                });
            });
        }).catch(function (err) {
            reject(err);
        });
    },
    copyAllEmptyAll:  function (filter, callback) {
        let that = this;
        return new Promise(function (resolve, reject) {
            MongoClient.connect(url,  { useUnifiedTopology: true } ,function (err, client) {
                var i = 0;
                var list = [];
                var listIds = [];
                // Get the documents collection
                var collection = client.db(dbName).collection(tblSource);
                // Find some documents
                collection.find(filter).toArray(function (err, docs) {
                    assert.equal(err, null);
                    docs.forEach(function(item) {
                        //console.log("item:", item.compId);
                        var isInclude = item.compId.includes('?wCompId');
                        if(isInclude){
                            i++;
                            //console.log("item:", item.compId);
                            var res = item.compId.split("?");
                            item.compId = res[0];
                            //client.db(dbName).collection(tblTarget).insertOne(item);
                        }else{
                            list.push(item);
                            //listIds.push({_id:item._id});
                            client.db(dbName).collection(tblSource).removeOne({"_id":item._id});
                            //client.db(dbName).collection(tblTarget).insertOne(item,{ignoreUndefined:true});
                        }
                    });
                    // remove all records
                    //client.db(dbName).collection(tblSource).removeMany(list,{ignoreUndefined:true},function () {
                        client.db(dbName).collection(tblTarget).insertMany(list,{},function () {

                        });
                    //});

                    //console.log("i:", i , "    Total=>", docs.length);
                    client.close();
                    console.log("disconnect db server");
                    callback(docs);
                });
            });
        }).catch(function (err) {
            reject(err);
        });
    },
    close: function () {
        DBCon.close();
        console.log("disconnect db server");
    }
}

module.exports = {
    DB: mongoDBLibrary
};
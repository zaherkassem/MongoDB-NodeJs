const crypto = require('crypto');

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'wix_google_calendar';
const tblSource = "settings";
const tblTarget = "settingsNew";
const tblTarget2 = "settingsEnc";
let DBCon = "";

var secretKey = "zNtxb4YU3JUCxt2vBk9cjtyQjXvBEpjd"; //32 char
var ivKey = secretKey.substr(0,16);// 16 char

function encrypt(str) {
    if(str == "") return str;
    const encryptor = crypto.createCipheriv('AES-256-CBC', secretKey, ivKey);
    return encryptor.update(str, 'utf8', 'base64') + encryptor.final('base64');
}

function decrypt(str) {
    if(str == "") return str;
    const decryptor = crypto.createDecipheriv('AES-256-CBC',secretKey, ivKey);
    return decryptor.update(str, 'base64', 'utf8') + decryptor.final('utf8');
}

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
    findAll: function (filter, limit,callback) {
        let that = this;
        return new Promise(function (resolve, reject) {
            MongoClient.connect(url,  { useUnifiedTopology: true } ,function (err, client) {
                // Get the documents collection
                let collection = client.db(dbName).collection(tblSource);
                // Find some documents
                let index = 0 ;
                collection.find(filter).limit(limit).toArray(function (err, docs) {
                    assert.equal(err, null);
                    docs.forEach(function(item) {
                        index++;
                        console.log('"compId":"', item.compId, '", "instanceId":"',  item.instanceId,'"');
                        item.settings.accountDetails.clientId       = encrypt(item.settings.accountDetails.clientId);
                        item.settings.accountDetails.emailAddress   = encrypt(item.settings.accountDetails.emailAddress);
                        item.settings.accountDetails.accessToken    = encrypt(item.settings.accountDetails.accessToken);
                        item.settings.accountDetails.refreshToken   = encrypt(item.settings.accountDetails.refreshToken);
                        item.settings.accountDetails.selected_cal   = encrypt(item.settings.accountDetails.selected_cal);
                        //var clientIdDecrypt  = decrypt(clientIdEncrypt);
                        var itemId  = item._id;
                        delete item._id;

                        client.db(dbName).collection(tblTarget2).insertOne(item,{ignoreUndefined:true});
                        collection.deleteOne({"_id":itemId});

                        //console.log("clientIdEncrypt:", clientIdEncrypt);
                        //console.log("clientIdDecrypt:", clientIdDecrypt);
                    });
                    client.close();
                    console.log("disconnect db server");
                    callback(index);
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

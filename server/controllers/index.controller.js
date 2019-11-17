'use strict';
let mongoDBLibrary = require('../api/data/db');
let Router = require('express').Router;
let router = new Router();

function deleteAll (){
    let filter = {"compId": "-1"};
    mongoDBLibrary.DB.delete(filter, function (docs) {
        console.log("removed all compId equal -1:",docs);
    });
}

function findAll() {
    console.log("findAll function");
    let filter = {};
    mongoDBLibrary.DB.findAll(filter, function (data) {
        console.log("index:", data);
    }).catch(function (err) {
        console.log("findAll err:", err);
    });
}

function copyAllEmptyAll(){
    console.log("copyAllEmptyAll function");
    let filter = {"settings.accountDetails.clientId":"",
                  "settings.accountDetails.emailAddress":"",
                  "settings.accountDetails.accessToken":"",
                  "settings.accountDetails.refreshToken":"",
                  "settings.accountDetails.selected_cal":""
    };
    mongoDBLibrary.DB.copyAllEmptyAll(filter, function (data) {
        console.log("copyAllEmptyAll is done");
    }).catch(function (err) {
        console.log("findAll err:", err);
    });

}

router.get('/', function (req, res) {
    //findAll();
});

//deleteAll();
copyAllEmptyAll();


module.exports = router;

'use strict';
let mongoDBLibrary = require('../api/data/db');
let Router = require('express').Router;
let router = new Router();

function findAll() {
    console.log("findAll function");
    let filter = {};
    let limit = 100000;
    mongoDBLibrary.DB.findAll(filter, limit ,function (data) {
        console.log("index:", data);
    }).catch(function (err) {
        console.log("findAll err:", err);
    });
}

router.get('/', function (req, res) {
    //findAll();
});

//deleteAll();
findAll();

module.exports = router;

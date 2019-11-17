'use strict';
var express = require('express');
var config = require('./config');
var compression = require('compression');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();
var env = config.env;
var http = require('http');
var setApplicationRoutes = require('./routes.js');

app.engine('.ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');
//app.use(bodyParser.urlencoded({extended: false, limit: '50mb'}));
//app.use(bodyParser.json({limit: '50mb'}));
app.use(compression());
app.use(express.static(path.join(config.root, 'src')));
app.set('appPath', 'src');
app.set('views', 'src');

let server;
setApplicationRoutes(app);
server = http.createServer(app);

server.listen(config.port, config.ip, function () {
  console.log('\nExpress server listening on %d, in %s mode', config.port, app.get('env'));
  console.log('Press Ctrl+C to quit.');
  if (env === 'development') {
    require('ripe').ready();
  }
});

module.exports = server;

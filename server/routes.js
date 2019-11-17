'use strict';
var indexController = require('./controllers/index.controller');

module.exports = function (app) {
  app.use(['/index', '/index.html', '/'], indexController);
};

'use strict';

var path = require('path');
var _ = require('lodash');

var all = {
  env: 'local',
  root: path.normalize(process.cwd()),
  port: process.env.PORT || 9000,
  ip: ''
};

module.exports = _.merge(all, {});

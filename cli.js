#!/usr/bin/env node
'use strict';
var moment = require("moment");
var gant = require('./src/js/gantt.js')
var yaml = require('./src/js/yaml_parser')


var data = yaml.parse('./sample/tasks.yaml')

gant.init(data.range);
gant.update(data.resources);

console.log('<?xml version="1.0" encoding="utf-8"?>' + document.body.innerHTML)

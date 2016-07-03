#!/usr/bin/env node
'use strict';
var cmd = require('commander')
var gant = require('./src/js/gantt.js')
var yaml = require('./src/js/yaml_parser')

var program = cmd.version('0.1.0')
  .command('yaml2gantt')
  .usage('[options] <file>')
  .option('-c, --config <config>', 'Set config file path')
  .arguments('yaml_path')
  .parse(process.argv)

var config_file = './config.yaml'
if (program.config) {
  config_file = program.config
}
var config = yaml.config(config_file)

var filepath = program.args[0]
if (filepath == undefined) {
  program.help();
}

var data = yaml.parse(filepath)

gant.init(data.range, config);
gant.update(data.resources);

console.log('<?xml version="1.0" encoding="utf-8"?>' + document.body.innerHTML)

#!/usr/bin/env node
'use strict';
var cmd = require('commander')
var fs = require('fs')
var gant = require('./src/js/gantt.js')
var yaml = require('./src/js/yaml_parser')

var program = cmd.version('0.1.0')
  .command('yaml2gantt')
  .usage('[options] <file>')
  .option('-c, --config <config>', 'Set config path. default to ./config.yaml')
  .option('-o, --output <output_file>', 'Output to file')
  .option('-f, --format <html|svg>', 'Output format ')
  .arguments('yaml_path')
  .parse(process.argv)

var config = {
  "canvas": {
    "width": 1000,
    "height": 300
  },
  "holidays": []
}

if (program.config) {
  var config_file = program.config
  config = yaml.config(config_file)
} else {
  var config_file = './config.yaml'
  try{
    var stat = fs.statSync(config_file);
    if (stat != undefined && stat.isFile()){
      config = yaml.config(config_file)
    }
  }catch(e){}
}

var filepath = program.args[0]
if (filepath == undefined) {
  program.help();
}

var data = yaml.parse(filepath)

gant.init(data.range, config);
gant.update(data.resources);

var output_file = program.output;
var format = program.format || 'html';
var out;
if ( format == 'svg'){
  out = '<?xml version="1.0" encoding="utf-8"?>' + document.body.innerHTML;
} else if (format == 'html' ) {
  out = '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>'+ document.body.innerHTML + '</body></html>'
} else {
  console.error('Format:' + format + ' is not supported.')
  process.exit(1);
}
if (output_file == undefined ){
  console.log(out)
} else {
  fs.writeFileSync(output_file, out);
}

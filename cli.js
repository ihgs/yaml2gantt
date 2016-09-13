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
  .option('--compare <compare_file>', 'Set file which you want to compare')
  .arguments('yaml_path')
  .parse(process.argv)

var config = {
  "canvas": {
    "width": 1000,
    "height": 300
  },
  "holidays": [],
  "timeFormatLocale": {
    "dateTime" : "%a %b %e %X %Y",
    "date" : "%Y/%m/%d",
    "time" : "%H:%M:%S",
    "periods" : [ "AM", "PM" ],
    "days" : [
      "日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"
    ],
    "shortDays" : [ "日", "月", "火", "水", "木", "金", "土" ],
    "months" : [
      "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月",
      "11月", "12月"
    ],
    "shortMonths" : [
      "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月",
      "11月", "12月"
    ]
  }
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

var compare_file = program.compare
if (compare_file == undefined){
  var data = yaml.parse(filepath)
}else {
  var data = yaml.parse(filepath)
  var compare_data = yaml.parse(compare_file, data["range"]["start"], data["range"]["end"])
  data["resources"]["compared_tasks"] = []
  for (let key in data["resources"]["tasks"]) {
    for( let cKey in compare_data["resources"]["tasks"]){
      if (data["resources"]["tasks"][key]["id"] == compare_data["resources"]["tasks"][cKey]["id"]){
        compare_data["resources"]["tasks"][cKey]["y_index"] = data["resources"]["tasks"][key]["y_index"];
        data["resources"]["compared_tasks"].push(compare_data["resources"]["tasks"][cKey]);
      }
    }
  }
}
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

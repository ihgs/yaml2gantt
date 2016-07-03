'use strict';
var moment = require("moment");
var yaml = require('js-yaml')
var fs = require('fs')

var _inputPattern = [
  "MM/DD",
  "YYYYY/MM/DD"
]

exports.config = function(config_path){
  let config = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'));
  let holidays = [];
  for (let index in config.holidays){
    holidays.push(moment.utc(config.holidays[index], _inputPattern));
  }
  config.holidays = holidays;
  return config;
}

exports.parse = function(yaml_path){
  let doc = yaml.safeLoad(fs.readFileSync(yaml_path, 'utf8'));
  let range = doc.Range;
  let data = {};


  data["range"] = {}
  data["range"]["start"] = moment.utc(range.start, _inputPattern);
  data["range"]["end"] = moment.utc(range.end, _inputPattern).add(1, "days");

  data["resources"] = []
  let resources = doc.Resources
  for(let key in resources){
    let resource = {
      "id": key,
      "name": resources[key].name,
      "start": moment.utc(resources[key].start, _inputPattern),
      "end": moment.utc(resources[key].end, _inputPattern).add(1, "days")
    }
    data["resources"].push(resource)
  }

  return data;
}

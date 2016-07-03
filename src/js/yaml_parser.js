'use strict';
var moment = require("moment");
var yaml = require('js-yaml')
var fs = require('fs')

exports.parse = function(yaml_path){
  let doc = yaml.safeLoad(fs.readFileSync(yaml_path, 'utf8'));
  let range = doc.Range;
  let data = {};

  let inputPattern = [
    "YYYYY/MM/DD"
  ]
  data["range"] = {}
  data["range"]["start"] = moment.utc(range.start, inputPattern);
  data["range"]["end"] = moment.utc(range.end, inputPattern).add(1, "days");

  data["resources"] = []
  let resources = doc.Resources
  for(let key in resources){
    let resource = {
      "id": key,
      "name": resources[key].name,
      "start": moment.utc(resources[key].start, inputPattern),
      "end": moment.utc(resources[key].end, inputPattern).add(1, "days")
    }
    data["resources"].push(resource)
  }

  return data;
}

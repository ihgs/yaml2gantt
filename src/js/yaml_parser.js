'use strict';
var moment = require("moment");
var yaml = require('js-yaml');
var fs = require('fs');
var path = require('path');
var loader = require('./loader.js')

var _inputPattern = [ "MM/DD", "YYYYY/MM/DD" ];

exports.config = function(config_path) {
  let config = yaml.safeLoad(fs.readFileSync(config_path, 'utf8'));
  let holidays = [];
  for (let index in config.holidays) {
    holidays.push(moment.utc(config.holidays[index], _inputPattern));
  }
  config.holidays = holidays;
  config.timeFormatLocale = {
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
  };

  return config;
};

var index = 0;
exports.parse = function(yaml_path) {
  let doc = yaml.safeLoad(loader.load(yaml_path));
  let range = doc.Range;
  let data = {};

  data["range"] = {};
  data["range"]["start"] = moment.utc(range.start, _inputPattern);
  data["range"]["end"] = moment.utc(range.end, _inputPattern).add(1, "days");

  data["resources"] = {"tasks" : [], "sections" : [], "subsections" : []};
  let resources = doc.Resources;
  for (let key in resources) {
    let type = resources[key].type;
    if (type == 'external') {
      let _data = this.parse(loader.join(yaml_path, resources[key].include));

      Array.prototype.push.apply(data["resources"]["tasks"],
                                 _data["resources"]["tasks"]);
      Array.prototype.push.apply(data["resources"]["sections"],
                                 _data["resources"]["sections"]);
      Array.prototype.push.apply(data["resources"]["subsections"],
                                 _data["resources"]["subsections"]);
    } else if (type == 'section') {
      data["resources"]["sections"].push(
          {"name" : resources[key].name, "y_index" : index});
    } else if (type == 'subsection') {
      data["resources"]["subsections"].push(
          {"name" : resources[key].name, "y_index" : index});
    } else {
      let events = [];
      for (let ekey in resources[key].events) {
        events.push({
          "name" : resources[key].events[ekey].name,
          "date" : moment.utc(resources[key].events[ekey].date, _inputPattern),
          "y_index" : index
        });
      }

      let resource = {
        "id" : key,
        "name" : resources[key].name,
        "y_index" : index,
        "start" : moment.utc(resources[key].start, _inputPattern),
        "end" : moment.utc(resources[key].end, _inputPattern).add(1, "days"),
        "events" : events
      };
      data["resources"]["tasks"].push(resource);
      // イベントがあれば、イベント分incrementする。
      if (events.length > 0) {
        index++;
      }
    }
    index++;
  }

  return data;
};

'use strict';
var moment = require("moment");
var yaml = require('js-yaml');
var fs = require('fs');
var loader = require('./loader.js');
var resource = require('./resources/resource.js');

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

function merge(base, other) {
  for (let key in base) {
    Array.prototype.push.apply(base[key], other[key]);
  }
}

var index = 0;
exports.parse = function(yaml_path, start, end, key_prefix) {
  let doc = yaml.safeLoad(loader.load(yaml_path));
  let range = doc.Range;
  let data = {};

  data["range"] = {};
  if (start == undefined) {
    start = moment.utc(range.start, _inputPattern);
  }
  if (end == undefined) {
    end = moment.utc(range.end, _inputPattern).add(1, "days");
  }
  if (key_prefix == undefined) {
    key_prefix = '';
  }

  data["range"]["start"] = start;
  data["range"]["end"] = end;

  data["resources"] = {"tasks" : [], "sections" : [], "subsections" : []};
  let resources = doc.Resources;
  for (let key in resources) {
    let type = resources[key].type;
    if (type == 'external') {
      let _data = this.parse(loader.join(yaml_path, resources[key].include),
                             start, end, key + "::");
      merge(data["resources"], _data["resources"]);
    } else if (type == 'section') {
      data["resources"]["sections"].push(
          {"name" : resources[key].name, "y_index" : index});
    } else if (type == 'subsection') {
      data["resources"]["subsections"].push(
          {"name" : resources[key].name, "y_index" : index});
    } else {
      if (!resource.withinPriod(resources[key], "task", start, end)) {
        continue;
      }
      let events = [];
      for (let ekey in resources[key].events) {
        events.push({
          "name" : resources[key].events[ekey].name,
          "date" : moment.utc(resources[key].events[ekey].date, _inputPattern),
          "y_index" : index
        });
      }

      let task = {
        "id" : key_prefix + key,
        "name" : resources[key].name,
        "y_index" : index,
        "start" : moment.utc(resources[key].start, _inputPattern),
        "end" : moment.utc(resources[key].end, _inputPattern).add(1, "days"),
        "events" : events
      };
      data["resources"]["tasks"].push(task);
      // イベントがあれば、イベントを表示する分を確保するためインクリメントする。
      if (events.length > 0) {
        index++;
      }
    }
    index++;
  }

  return data;
};

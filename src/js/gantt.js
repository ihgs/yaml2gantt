'use strict';

var d3 = require("d3")
var jsdom = require('jsdom');
var fs = require('fs');

global.document = jsdom.jsdom(`
<!DOCTYPE html>
<html>
  <head>
  </head>
  <body>
  </body>
</html>
`);




var _weekendsGroup;
var _tasksGroup;
var _svg;
var _monthAxis;
var _xScale;
var _width;
var _height;
var _xAxis;

function daysToPixels(days, timeScale) {
    var d1 = new Date();
    timeScale || (timeScale = g_timescale);
    return timeScale(d3.utcDay.offset(d1, days)) - timeScale(d1);
}

var g_timescale;

var adjustTextLabels = function (selection) {
    selection.selectAll('.tick text')
        .attr('transform', 'translate(' + daysToPixels(1) / 2 + ',0)');
}

function addGradient(svg) {
    var start = d3.rgb(155, 147, 230);
    var stop = start.darker(3);

    var gradient = svg.append("svg:defs")
        .append("svg:linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");

    // Define the gradient colors
    gradient.append("svg:stop")
        .attr("offset", "0%")
        .attr("stop-color", start.toString())
        .attr("stop-opacity", 1);

    gradient.append("svg:stop")
        .attr("offset", "100%")
        .attr("stop-color", stop.toString())
        .attr("stop-opacity", 1);
};

exports.update = function(data){
  var backgroundFill = function (range, className) {
       var days = _weekendsGroup.selectAll("rect." + className)
                     .data(range(_xScale.invert(0), _xScale.invert(_width)));
                     days.enter()
                     .append("rect")
                     .attr("class", className)
                     .attr("x", function (item) {
                         return _xScale(item);
                     })
                     .attr("y", 0)
                     .attr("width", daysToPixels(1, _xScale))
                     .attr("height", _height);

       days.exit().remove();
   };
   backgroundFill(d3.utcSunday.range, "sundayBackground");
   backgroundFill(d3.utcSaturday.range, "saturdayBackground");

   var tasks = _tasksGroup.selectAll("rect.taskRange")
       .data(data);

   tasks.enter()
       .append("rect")
       .attr("class", "taskRange")
       .attr("x", function (item) {
          return _xScale(item.start);
        }).attr("y", function (item, i) {
          return i * 30 + 20
        }).attr("width", function (item) {
          return Math.abs(_xScale(item.end) - _xScale(item.start));
        }).attr("height", 10);

   tasks.exit().remove();

   var text = _tasksGroup.selectAll("text.taskName")
       .data(data);

   text.enter()
       .append("text")
       .attr("class", "taskName")
       .text(function (item) {
           return item.name
       })
       .attr("text-anchor", "end")
       .attr("x", function (item) {
           return _xScale(item.start) - 10
       })
       .attr("y", function (item, i) {
           return i * 30 + 30
       });

   text.exit().remove();

   //タスクのラベル表示
   text.text(function (item) {
       return item.name
   })

};

function load_css(){
  return fs.readFileSync("./src/css/gantt.css")
}

exports.init = function(range){
  var self = this;
  var margin = { top: 50, right: 20, bottom: 20, left: 20 };
  //_width = parseInt(d3.select(".ganttGraph").style("width"), 10) - margin.left - margin.right;
  //_height = document.querySelector(".ganttGraph").clientHeight - margin.top - margin.bottom;
  _width = 800
  _height = 300

  //初期表示範囲設定
  var dateStart = range.start;
  var dateEnd = range.end

  _xScale = d3.scaleUtc()
      .domain([dateStart, dateEnd])
      .range([0, _width]);

  g_timescale = _xScale;

  //曜日表示を日本語に設定
  var ja_JP = d3.formatLocale({
      "decimal": ".",
      "thousands": ",",
      "grouping": [3],
      "currency": ["", "円"],
      "dateTime": "%a %b %e %X %Y",
      "date": "%Y/%m/%d",
      "time": "%H:%M:%S",
      "periods": ["AM", "PM"],
      "days": ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"],
      "shortDays": ["日", "月", "火", "水", "木", "金", "土"],
      "months": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
      "shortMonths": ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
  });

  //X軸表示設定
  _xAxis = d3.axisTop(_xScale)
      .ticks(d3.utcDay.every(1))
      .tickSize(_height)
      .tickFormat(d3.timeFormat("%-d"));

  _monthAxis = d3.axisTop(_xScale)
      .ticks(d3.utcMonth.every(1))
      .tickSize(_height + 20)
      .tickFormat(d3.timeFormat("%B"));

  //SVG生成
  _svg = d3.select(document.body).append("svg")
      .attr("width", _width + margin.left + margin.right)
      .attr("height", _height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  //css
  _svg.append("defs")
      .append("style")
      .text("<![CDATA[" + load_css() + "]]>");

  //X軸目盛り追加
  _svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + _height + ")")
      .call(_xAxis)
      .call(adjustTextLabels);

  _svg.append("g")
      .attr("class", "x monthAxis")
      .attr("transform", "translate(0," + _height + ")")
      .call(_monthAxis);

  _weekendsGroup = _svg.append("g")
      .attr("class", "weekends");

  _tasksGroup = _svg.append("g")
      .attr("class", "tasks");

  addGradient(_svg);
}

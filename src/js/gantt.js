'use strict';

var d3 = require("d3");
var jsdom = require('jsdom');
var fs = require('fs');

global.document =
    jsdom.jsdom('<!DOCTYPE html><html><head></head><body></body></html>');

var _weekendsGroup;
var _sectionsGroup;
var _tasksGroup;
var _holidaysGroup;
var _holidays;
var _svg;
var _monthAxis;
var _xScale;
var _width;
var _height;
var _xAxis;
var _rowHeight = 30;
var _locale;

function daysToPixels(days, timeScale) {
  let d1 = new Date();
  timeScale || (timeScale = g_timescale);
  return timeScale(d3.utcDay.offset(d1, days)) - timeScale(d1);
}

var g_timescale;

var adjustTextLabels = function(selection) {
  selection.selectAll('.tick text')
      .attr('transform', 'translate(' + daysToPixels(1) / 2 + ',0)');
};

function addGradient(defs) {
  var start = d3.rgb(155, 147, 230);
  var stop = start.darker(3);

  var gradient = defs.append("svg:linearGradient")
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
}

exports.update = function(data) {
  var backgroundFill = function(range, className) {
    var days = _weekendsGroup.selectAll("rect." + className)
                   .data(range(_xScale.invert(0), _xScale.invert(_width)));
    days.enter()
        .append("rect")
        .attr("class", className)
        .attr("x", function(item) { return _xScale(item); })
        .attr("y", 0)
        .attr("width", daysToPixels(1, _xScale))
        .attr("height", _height);

    days.exit().remove();
  };
  backgroundFill(d3.utcSunday.range, "sundayBackground");
  backgroundFill(d3.utcSaturday.range, "saturdayBackground");

  var holidays = _holidaysGroup
                     .selectAll("rect." +
                                "holidayBackground")
                     .data(_holidays);
  holidays.enter()
      .append("rect")
      .attr("class", "holidayBackground")
      .attr("x", function(item) { return _xScale(item); })
      .attr("y", 0)
      .attr("width", daysToPixels(1, _xScale))
      .attr("height", _height);
  holidays.exit().remove();

  var tasksGroup = _tasksGroup.selectAll("rect.taskGroup").data(data["tasks"]);

  var task_group = tasksGroup.enter().append("g");

  task_group.append("rect")
      .attr("class", "taskRange")
      .attr("x", function(item) { return _xScale(item.start); })
      .attr("y", function(item) { return item.y_index * _rowHeight + 20; })
      .attr("width",
            function(item) {
              return Math.abs(_xScale(item.end) - _xScale(item.start));
            })
      .attr("height", 10)
      .append("title")
      .text(function(item) { return item.name; });

  task_group.append("text")
      .attr("class", "taskName")
      .text(function(item) { return item.name; })
      .attr("text-anchor", "end")
      .attr("x", function(item) { return _xScale(item.start) - 10; })
      .attr("y", function(item) { return item.y_index * _rowHeight + 30; })
      .text(function(item) { return item.name; });

  var events = task_group.selectAll("rect.events").data(function(item) {
    return item.events;
  });

  events.enter()
      .append("path")
      .attr("class", "event")
      .attr("transform",
            function(item) {
              let y = item.y_index * _rowHeight + 40;
              return "translate(" + _xScale(item.date) + "," + y + ")";
            })
      .attr("d", d3.symbol().type(d3.symbolTriangle))
      .append("title")
      .text(function(item) { return item.name; });

  var events_text =
      task_group.selectAll("rect.events.text").data(function(item) {
        return item.events;
      });
  events_text.enter()
      .append("text")
      .attr("class", "eventName")
      .attr("text-anchor", "start")
      .attr("x", function(item) { return _xScale(item.date); })
      .attr("y", function(item) { return item.y_index * _rowHeight + 60; })
      .text(function(item) { return item.name; });

  events.exit().remove();
  tasksGroup.exit().remove();

  var sections =
      _sectionsGroup.selectAll("path.sections").data(data["sections"]);

  var line =
      d3.line().x(function(d) { return d[0]; }).y(function(d) { return d[1]; });
  sections.enter()
      .append("path")
      .attr("stroke", "black")
      .attr("fill", "none")
      .attr("d", function(item) {
        return line([
          [ 0, item.y_index * _rowHeight + 20 ],
          [ _width, item.y_index * _rowHeight + 20 ]
        ]);
      });

  var sections_text =
      _sectionsGroup.selectAll("path.sections").data(data["sections"]);
  sections_text.enter()
      .append("text")
      .attr("text-anchor", "start")
      .attr("class", "sectionName")
      .attr("x", 0)
      .attr("y", function(item) { return item.y_index * _rowHeight + 20 + 15; })
      .text(function(item) { return item.name; });
};

function load_css() { return fs.readFileSync(__dirname + "/../css/gantt.css"); }

function every_day(d) { return _locale.format("%-d")(d); }

function every_week(d) {
  if (d.getDay() == 1) {
    return _locale.format("%-d")(d);
  }
}

exports.init = function(range, config) {
  var margin = {top : 50, right : 20, bottom : 20, left : 20};

  _width = config.canvas.width;
  _height = config.canvas.height;

  _holidays = config.holidays;

  //初期表示範囲設定
  var dateStart = range.start;
  var dateEnd = range.end;

  _xScale = d3.scaleUtc().domain([ dateStart, dateEnd ]).range([ 0, _width ]);

  g_timescale = _xScale;

  _locale = d3.timeFormatLocale(config.timeFormatLocale);

  var dateLabelType;
  if (config.dateLabelType == "every_week") {
    dateLabelType = every_week;
  } else {
    dateLabelType = every_day;
  }

  // X軸表示設定
  _xAxis = d3.axisTop(_xScale)
               .ticks(d3.utcDay.every(1))
               .tickSize(_height)
               .tickFormat(dateLabelType);

  _monthAxis = d3.axisTop(_xScale)
                   .ticks(d3.utcMonth.every(1))
                   .tickSize(_height + 20)
                   .tickFormat(_locale.format("%B"));

  // SVG生成
  var base_svg = d3.select(document.body)
                     .append("svg")
                     .attr("width", _width + margin.left + margin.right)
                     .attr("height", _height + margin.top + margin.bottom)
                     .attr("xmlns", "http://www.w3.org/2000/svg");

  // css
  var defs = base_svg.append("defs");
  addGradient(defs);
  defs.append("style").text("<![CDATA[" + load_css() + "]]>");

  _svg = base_svg.append("g").attr("transform", "translate(" + margin.left +
                                                    "," + margin.top + ")");

  // X軸目盛り追加
  _svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + _height + ")")
      .call(_xAxis)
      .call(adjustTextLabels);

  _svg.append("g")
      .attr("class", "x monthAxis")
      .attr("transform", "translate(0," + _height + ")")
      .call(_monthAxis);

  _weekendsGroup = _svg.append("g").attr("class", "weekends");

  _holidaysGroup = _svg.append("g").attr("class", "holidays");

  _sectionsGroup = _svg.append("g").attr("class", "sections");

  _tasksGroup = _svg.append("g").attr("class", "tasks");

};

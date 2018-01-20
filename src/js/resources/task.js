'use strict';

var d3 = require("d3");
var moment = require("moment");

var _inputPattern = [ "MM/DD", "YYYYY/MM/DD" ];
var barHeight = 10;

exports.tasks = function(_tasksGroup, data, _rowHeight, _width, _xScale) {
  let tasksGroup = _tasksGroup.selectAll("rect.taskGroup").data(data["tasks"]);

  let task_group = tasksGroup.enter().append("g");

  task_group.append("rect")
      .attr("class", "taskRange")
      .attr("x", function(item) { return _xScale(item.start); })
      .attr("y", function(item) { return item.y_index * _rowHeight + 20; })
      .attr("width",
            function(item) {
              return Math.abs(_xScale(item.end) - _xScale(item.start));
            })
      .attr("height", barHeight)
      .append("title")
      .text(function(item) { return item.name; });

  task_group.append("text")
      .attr("class", "taskName")
      .text(function(item) { return item.name; })
      .attr("text-anchor", "end")
      .attr("x", function(item) { return _xScale(item.start) - 10; })
      .attr("y", function(item) { return item.y_index * _rowHeight + 30; })
      .text(function(item) { return item.name; });

  let events = task_group.selectAll("rect.events")
                   .data(function(item) { return item.events; });

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

  let events_text = task_group.selectAll("rect.events.text")
                        .data(function(item) { return item.events; });
  events_text.enter()
      .append("text")
      .attr("class", "eventName")
      .attr("text-anchor", "start")
      .attr("x", function(item) { return _xScale(item.date); })
      .attr("y", function(item) { return item.y_index * _rowHeight + 60; })
      .text(function(item) { return item.name; });

  events.exit().remove();
  tasksGroup.exit().remove();
};

exports.withinPriod = function(task, start, end) {
  let s = moment.utc(task.start, _inputPattern);
  let e = moment.utc(task.start, _inputPattern);
  if (s == undefined || e == undefined) {
    return false;
  }
  if (start > e || s > end) {
    return false;
  }
  return true;
};

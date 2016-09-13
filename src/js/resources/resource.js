'use strict';

var task = require('./task.js');
var comparedTask = require('./comparedTask.js');
var section = require('./section.js');
var subsection = require('./subsection.js');

exports.tasks = function(_taskGroup, data, _xScale) {
  task.tasks(_taskGroup, data, _xScale);
};

exports.comparedTasks = function(_taskGroup, data, _xScale) {
  comparedTask.tasks(_taskGroup, data, _xScale);
};

exports.sections = function(_sectionsGroup, data) {
  section.sections(_sectionsGroup, data);
};

exports.subsections = function(_subsectionsGroup, data) {
  subsection.subsections(_subsectionsGroup, data);
};

exports.withinPriod = function(data, type, start, end) {
  if (type == 'task') {
    return task.withinPriod(data, start, end);
  }
  return false;
};

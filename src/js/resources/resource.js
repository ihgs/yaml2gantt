'use strict';

const task = require('./task.js');
const comparedTask = require('./comparedTask.js');
const section = require('./section.js');
const subsection = require('./subsection.js');

exports.tasks = function(_taskGroup, data, _rowHeight, _width, _xScale) {
  task.tasks(_taskGroup, data, _rowHeight, _width, _xScale);
};

exports.comparedTasks = function(
  _taskGroup,
  data,
  _rowHeight,
  _width,
  _xScale
) {
  comparedTask.tasks(_taskGroup, data, _rowHeight, _width, _xScale);
};

exports.sections = function(_sectionsGroup, data, _rowHeight, _width) {
  section.sections(_sectionsGroup, data, _rowHeight, _width);
};

exports.subsections = function(_subsectionsGroup, data, _rowHeight) {
  subsection.subsections(_subsectionsGroup, data, _rowHeight);
};

exports.withinPriod = function(data, type, start, end) {
  if (type == 'task') {
    return task.withinPriod(data, start, end);
  }
  return false;
};

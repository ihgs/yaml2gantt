'use strict';

var task = require('./task.js');
var section = require('./section.js');
var subsection = require('./subsection.js');

exports.tasks = function(_taskGroup, data, _rowHeight, _width, _xScale) {
  task.tasks(_taskGroup, data, _rowHeight, _width, _xScale);
};

exports.sections = function(_sectionsGroup, data, _rowHeight, _width) {
  section.sections(_sectionsGroup, data, _rowHeight, _width);
};

exports.subsections = function(_subsectionsGroup, data, _rowHeight) {
  subsection.subsections(_subsectionsGroup, data, _rowHeight);
};

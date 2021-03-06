'use strict';

const d3 = require('d3');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const resource = require('./resources/resource.js');

global.document = new JSDOM(
  '<!DOCTYPE html><html><head></head><body></body></html>'
).window.document;

let _weekendsGroup;
let _sectionsGroup;
let _subsectionsGroup;
let _tasksGroup;
let _comparedTasksGroup;
let _holidaysGroup;
let _holidays;
let _svg;
let _monthAxis;
let _xScale;
let _width;
let _height;
let _xAxis;
let _rowHeight = 30;
let _locale;

function daysToPixels(days, timeScale) {
  let d1 = new Date();
  timeScale || (timeScale = g_timescale);
  return timeScale(d3.utcDay.offset(d1, days)) - timeScale(d1);
}

let g_timescale;

const adjustTextLabels = function(selection) {
  selection
    .selectAll('.tick text')
    .attr('transform', 'translate(' + daysToPixels(1) / 2 + ',0)');
};

exports.update = function(data) {
  const backgroundFill = function(range, className) {
    let days = _weekendsGroup
      .selectAll('rect.' + className)
      .data(range(_xScale.invert(0), _xScale.invert(_width)));
    days
      .enter()
      .append('rect')
      .attr('class', className)
      .attr('x', function(item) {
        return _xScale(item);
      })
      .attr('y', 0)
      .attr('width', daysToPixels(1, _xScale))
      .attr('height', _height);

    days.exit().remove();
  };
  backgroundFill(d3.utcSunday.range, 'sundayBackground');
  backgroundFill(d3.utcSaturday.range, 'saturdayBackground');

  let holidays = _holidaysGroup
    .selectAll('rect.' + 'holidayBackground')
    .data(_holidays);
  holidays
    .enter()
    .append('rect')
    .attr('class', 'holidayBackground')
    .attr('x', function(item) {
      return _xScale(item);
    })
    .attr('y', 0)
    .attr('width', daysToPixels(1, _xScale))
    .attr('height', _height);
  holidays.exit().remove();

  resource.tasks(_tasksGroup, data, _rowHeight, _width, _xScale);
  resource.comparedTasks(
    _comparedTasksGroup,
    data,
    _rowHeight,
    _width,
    _xScale
  );
  resource.sections(_sectionsGroup, data, _rowHeight, _width);
  resource.subsections(_subsectionsGroup, data, _rowHeight);
};

function load_css() {
  return fs.readFileSync(__dirname + '/../css/gantt.css');
}

function every_day(d) {
  return _locale.format('%-d')(d);
}

function every_week(d) {
  if (d.getDay() == 1) {
    return _locale.format('%-d')(d);
  }
}

exports.init = function(range, config) {
  let margin = { top: 50, right: 20, bottom: 20, left: 20 };

  _width = config.canvas.width;
  _height = config.canvas.height;

  _holidays = config.holidays;

  //初期表示範囲設定
  let dateStart = range.start;
  let dateEnd = range.end;

  _xScale = d3
    .scaleUtc()
    .domain([dateStart, dateEnd])
    .range([0, _width]);

  g_timescale = _xScale;

  _locale = d3.timeFormatLocale(config.timeFormatLocale);

  let dateLabelType;
  if (config.dateLabelType == 'every_week') {
    dateLabelType = every_week;
  } else {
    dateLabelType = every_day;
  }

  // X軸表示設定
  _xAxis = d3
    .axisTop(_xScale)
    .ticks(d3.utcDay.every(1))
    .tickSize(_height)
    .tickFormat(dateLabelType);

  _monthAxis = d3
    .axisTop(_xScale)
    .ticks(d3.utcMonth.every(1))
    .tickSize(_height + 20)
    .tickFormat(_locale.format('%B'));

  // SVG生成
  let base_svg = d3
    .select(document.body)
    .append('svg')
    .attr('width', _width + margin.left + margin.right)
    .attr('height', _height + margin.top + margin.bottom)
    .attr('xmlns', 'http://www.w3.org/2000/svg');

  // css
  let defs = base_svg.append('defs');
  defs.append('style').text('<![CDATA[' + load_css() + ']]>');

  base_svg
    .append('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', 'white');

  _svg = base_svg
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  // X軸目盛り追加
  _svg
    .append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + _height + ')')
    .call(_xAxis)
    .call(adjustTextLabels);

  _svg
    .append('g')
    .attr('class', 'x monthAxis')
    .attr('transform', 'translate(0,' + _height + ')')
    .call(_monthAxis);

  _weekendsGroup = _svg.append('g').attr('class', 'weekends');
  _holidaysGroup = _svg.append('g').attr('class', 'holidays');

  _sectionsGroup = _svg.append('g').attr('class', 'sections');
  _subsectionsGroup = _svg.append('g').attr('class', 'subsections');
  _tasksGroup = _svg.append('g').attr('class', 'tasks');
  _comparedTasksGroup = _svg.append('g').attr('class', 'comparedTasks');
};

exports.out = function(format = 'html') {
  if (format == 'svg' || format == 'png') {
    const data =
      '<?xml version="1.0" encoding="utf-8"?>' + document.body.innerHTML;
    return data;
  } else if (format == 'html') {
    const data =
      '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>' +
      document.body.innerHTML +
      '</body></html>';
    return data;
  }
};

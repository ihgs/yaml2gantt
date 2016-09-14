'use strict';

var d3 = require("d3");

exports.sections = function(_sectionsGroup, data, _rowHeight, _width) {
  let sections =
      _sectionsGroup.selectAll("path.sections").data(data["sections"]);

  let line =
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

  let sections_text =
      _sectionsGroup.selectAll("path.sections").data(data["sections"]);
  sections_text.enter()
      .append("text")
      .attr("text-anchor", "start")
      .attr("class", "sectionName")
      .attr("x", 0)
      .attr("y", function(item) { return item.y_index * _rowHeight + 20 + 15; })
      .text(function(item) { return item.name; });
};

'use strict';

exports.tasks = function(_comparedTasksGroup, data, _rowHeight, _width,
                         _xScale) {
  if (data["compared_tasks"] == undefined) {
    return;
  }
  let tasksGroup = _comparedTasksGroup.selectAll("rect.comparedTaskGroup")
                       .data(data["compared_tasks"]);

  let task_group = tasksGroup.enter().append("g");

  task_group.append("rect")
      .attr("class", "comparedTaskRange")
      .attr("x", function(item) { return _xScale(item.start); })
      .attr("y", function(item) { return item.y_index * _rowHeight + 20 - 10; })
      .attr("width",
            function(item) {
              return Math.abs(_xScale(item.end) - _xScale(item.start));
            })
      .attr("height", 10)
      .append("title")
      .text(function(item) { return item.name; });
  tasksGroup.exit().remove();
};

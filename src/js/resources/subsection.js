'use strict';

exports.subsections = function(_subsectionsGroup, data, _rowHeight) {
  let subsections_text = _subsectionsGroup
    .selectAll('path.subsections')
    .data(data['subsections']);

  subsections_text
    .enter()
    .append('text')
    .attr('text-anchor', 'start')
    .attr('class', 'subsectionName')
    .attr('x', 0)
    .attr('y', function(item) {
      return item.y_index * _rowHeight + 20 + 15;
    })
    .text(function(item) {
      return item.name;
    });
};

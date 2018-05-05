'use strict';
const fs = require('fs');

const checkFile = function(filePath) {
  let stat;
  try {
    stat = fs.statSync(filePath);
  } catch (e) {
    throw `Not found file: ${filePath}`;
  }
  if (!stat.isFile()) {
    throw `Specified value is invalid: ${filePath}`;
  }
};

exports.validateOptions = function(program) {
  const filepath = program.args[0];
  if (filepath == undefined) {
    throw 'Target file is not specified.';
  }
  checkFile(filepath);

  if (!['html', 'png', 'svg'].includes(program.format)) {
    console.log(program.format);
    throw 'Format:' + program.format + ' is not supported.';
  }
  if (program.stdout && program.format == 'png') {
    throw 'stdout option is not used when format is png.';
  }
  if (program.compare && program.compareGit) {
    throw 'compare and compare-git option can not be specified at the same time.';
  }
  if (program.config) {
    checkFile(program.config);
  }
};

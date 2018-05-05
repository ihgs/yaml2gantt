#!/usr/bin/env node
'use strict';
const cmd = require('commander');
const fs = require('fs');
const path = require('path');
const svg2png = require('svg2png');
const gant = require('./src/js/gantt.js');
const yaml = require('./src/js/yaml_parser');
const conf = require('./src/js/config');
const validator = require('./src/js/validator.js');

const program = cmd
  .version('0.1.0')
  .command('yaml2gantt')
  .usage('[options] <file>')
  .option('-c, --config <config>', 'Set config path. default to ./config.yaml')
  .option(
    '-o, --output <output_file>',
    'Output to a specified file. [Default: input filename + ext in current directory.]'
  )
  .option('-f, --format <html|svg|png>', 'Output format.')
  .option('--compare <compare_file>', 'Set file which you want to compare')
  .option('--compare-git <hash>', 'Set git hash')
  .option('--stdout', 'Output to stdout [Default: output to a file.]')
  .arguments('yaml_path')
  .parse(process.argv);

try {
  validator.validateOptions(program);
} catch (msg) {
  console.error(msg);
  /* eslint no-process-exit:0 */
  process.exit(1);
}

const config = conf.loadConfig(program.config);

const filepath = program.args[0];
const data = yaml.parse(filepath);
const compare_file = program.compare;
const compare_hash = program.compareGit;
if (compare_file || compare_hash) {
  let compare_data;

  if (compare_file) {
    compare_data = yaml.parse(
      compare_file,
      data['range']['start'],
      data['range']['end']
    );
  } else {
    compare_data = yaml.parse(
      filepath,
      data['range']['start'],
      data['range']['end'],
      undefined,
      compare_hash
    );
  }
  data['resources']['compared_tasks'] = [];
  for (let key in data['resources']['tasks']) {
    for (let cKey in compare_data['resources']['tasks']) {
      if (
        data['resources']['tasks'][key]['id'] ==
        compare_data['resources']['tasks'][cKey]['id']
      ) {
        compare_data['resources']['tasks'][cKey]['y_index'] =
          data['resources']['tasks'][key]['y_index'];
        data['resources']['compared_tasks'].push(
          compare_data['resources']['tasks'][cKey]
        );
      }
    }
  }
}
gant.init(data.range, config);
gant.update(data.resources);

const format = program.format || 'html';
const stdout = program.stdout;

const out = gant.out(format);
if (stdout) {
  console.log(out);
} else {
  let output_file = program.output;
  if (output_file == undefined) {
    let filename = path.basename(filepath);
    output_file = filename.replace(path.extname(filepath), '.' + format);
  }
  if (format == 'png') {
    svg2png(out)
      .then(buffer => fs.writeFileSync(output_file, buffer))
      .catch(e => console.error(e));
  } else {
    fs.writeFileSync(output_file, out);
  }
}

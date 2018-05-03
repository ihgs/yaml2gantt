#!/usr/bin/env node
'use strict';
const cmd = require('commander');
const fs = require('fs');
const path = require('path');
const svg2png = require('svg2png');
const gant = require('./src/js/gantt.js');
const yaml = require('./src/js/yaml_parser');

const program = cmd
  .version('0.1.0')
  .command('yaml2gantt')
  .usage('[options] <file>')
  .option('-c, --config <config>', 'Set config path. default to ./config.yaml')
  .option(
    '-o, --output <output_file>',
    'Output to a specified file. [Default: input filename + ext in current directory.'
  )
  .option('-f, --format <html|svg|png>', 'Output format.')
  .option('--compare <compare_file>', 'Set file which you want to compare')
  .option('--compare-git <hash>', 'Set git hash')
  .option('--stdout', 'Output to stdout [Default: output to a file.]')
  .arguments('yaml_path')
  .parse(process.argv);

let config = {
  canvas: {
    width: 1000,
    height: 300
  },
  holidays: [],
  timeFormatLocale: {
    dateTime: '%a %b %e %X %Y',
    date: '%Y/%m/%d',
    time: '%H:%M:%S',
    periods: ['AM', 'PM'],
    days: [
      '日曜日',
      '月曜日',
      '火曜日',
      '水曜日',
      '木曜日',
      '金曜日',
      '土曜日'
    ],
    shortDays: ['日', '月', '火', '水', '木', '金', '土'],
    months: [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月'
    ],
    shortMonths: [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月'
    ]
  }
};

if (program.config) {
  const config_file = program.config;
  config = yaml.config(config_file);
} else {
  const config_file = './config.yaml';
  try {
    const stat = fs.statSync(config_file);
    if (stat != undefined && stat.isFile()) {
      config = yaml.config(config_file);
    }
  } catch (e) {
    //no operation
  }
}

const filepath = program.args[0];
if (filepath == undefined) {
  program.help();
}

let data;
const compare_file = program.compare;
const compare_hash = program.compareGit;
if (compare_file == undefined && compare_hash == undefined) {
  data = yaml.parse(filepath);
} else {
  data = yaml.parse(filepath);

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

let output_file = program.output;
const format = program.format || 'html';
const stdout = program.stdout;

let out;
if (format == 'svg' || format == 'png') {
  out = '<?xml version="1.0" encoding="utf-8"?>' + document.body.innerHTML;
} else if (format == 'html') {
  out =
    '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>' +
    document.body.innerHTML +
    '</body></html>';
} else {
  console.error('Format:' + format + ' is not supported.');
  // eslint-disable-next-line no-process-exit
  process.exit(1);
}
if (stdout) {
  if (format == 'png') {
    console.error('stdout option is not used when format is png.');
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  }
  console.log(out);
} else {
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

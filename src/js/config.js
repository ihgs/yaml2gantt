'use strict';
const fs = require('fs');
const yaml = require('./yaml_parser');

exports.loadConfig = function(argConfig) {
  let config = {
    canvas: { width: 1000, height: 300 },
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

  if (argConfig) {
    const config_file = argConfig;
    config = yaml.config(config_file);
  } else {
    const config_file = './config.yaml';
    try {
      const stat = fs.statSync(config_file);
      if (stat != undefined && stat.isFile()) {
        config = yaml.config(config_file);
      }
    } catch (e) {
      // no operation. use default config
    }
  }
  return config;
};

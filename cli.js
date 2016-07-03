#!/usr/bin/env node
'use strict';
var gant = require('./src/js/gantt.js')

gant.init()
gant.update()

console.log('<?xml version="1.0" encoding="utf-8"?>' + document.body.innerHTML)

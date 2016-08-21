'use strict';
var fs = require('fs');
var path = require('path');
var request = require('sync-request');

exports.load = function(path){
  if(path.startsWith('http')){
    return http(path);
  }else{
    return file(path);
  }
}

exports.join = function(uri, filename){
  if(uri.startsWith('http://') || uri.startsWith('https://') ){
    return uri + "/../" + filename;
  }else{
    return path.join(path.dirname(uri), filename);
  }
}

function http(url){
  let res = request('GET', url);
  return res.getBody('utf8');
}

function file(uri){
  return fs.readFileSync(uri, 'utf8')
}

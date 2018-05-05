'use strict';
const fs = require('fs');
const path = require('path');
const request = require('sync-request');

exports.load = function(path, commitHash) {
  if (path.startsWith('http')) {
    return http(path);
  } else {
    if (commitHash == undefined) {
      return file(path);
    } else {
      return git(path, commitHash);
    }
  }
};

exports.join = function(uri, filename) {
  if (uri.startsWith('http://') || uri.startsWith('https://')) {
    return uri + '/../' + filename;
  } else {
    return path.join(path.dirname(uri), filename);
  }
};

function http(url) {
  let res = request('GET', url);
  return res.getBody('utf8');
}

function file(uri) {
  return fs.readFileSync(uri, 'utf8');
}

function git(path, hash) {
  let ret;
  let done = false;
  const git = require('simple-git');
  git('.').show([hash + ':' + path], (err, result) => {
    ret = result;
    done = true;
  });

  require('deasync').loopWhile(function() {
    return !done;
  });
  return ret;
}

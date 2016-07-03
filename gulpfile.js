var gulp = require('gulp');
var run = require('gulp-run');
var rename = require("gulp-rename");

gulp.task('create_svg', function(){
  return run('./cli.js').exec()
    .pipe(rename('test.svg'))
    .pipe(gulp.dest('tmp/'))
    .pipe(rename('test.html'))
    .pipe(gulp.dest('tmp/'))
});

gulp.task('watch', function(){
  gulp.watch(['./cli.js', './src/**'], ['create_svg']);
});

var gulp = require('gulp');
var run = require('gulp-run');
var rename = require("gulp-rename");
var gulpClangFormat = require("gulp-clang-format");
var gulpEslint = require("gulp-eslint");

gulp.task('create_html', function(){
  return run('./cli.js -f html ./sample/tasks.yaml').exec()
    .pipe(rename('test.html'))
    .pipe(gulp.dest('tmp/'))
});

gulp.task('create_svg', function(){
  return run('./cli.js -f svg ./sample/tasks.yaml').exec()
    .pipe(rename('test.svg'))
    .pipe(gulp.dest('tmp/'))
});

gulp.task('watch', function(){
  gulp.watch(['./cli.js', './src/**'], ['create_svg']);
});

gulp.task('check', ['lint-javascript', 'check-javascript-format']);

/**
 * Lints all projects JavaScript files using ESLint. This includes frontend sour
ce code, as well as,
 * build scripts.
 */
gulp.task('lint-javascript', function() {
  return gulp
    .src('src/**/*.js')
    // Attach lint output to the eslint property of the file.
    .pipe(gulpEslint())
    // Output the lint results to the console.
    .pipe(gulpEslint.format())
    // Exit with an error code (1) on a lint error.
    .pipe(gulpEslint.failOnError());
});

/**
 * Checks whether project's JavaScript files are formatted according to clang-format style.
 */
gulp.task('check-javascript-format', function() {
  return gulp.src('src/**/*.js')
    .pipe(gulpClangFormat.checkFormat('file', undefined, {verbos: true, fail: true}));
});

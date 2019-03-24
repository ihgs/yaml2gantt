/* eslint node/no-unpublished-require: 0 */
var gulp = require('gulp');
var ps = require('child_process').exec;
var fs = require('fs');
var gulpClangFormat = require('gulp-clang-format');
var gulpEslint = require('gulp-eslint');

gulp.task('create_html', function() {
  return ps('./cli.js -f html --stdout ./sample/tasks.yaml', function(
    err,
    stdout,
    stderr
  ) {
    if (err) {
      console.log(stderr);
      return;
    }
    console.log(stdout);
    fs.mkdir('tmp', function() {
      fs.writeFileSync('tmp/test.html', stdout);
    });
  });
});

gulp.task('create_svg', function() {
  return ps('./cli.js -f svg --stdout ./sample/tasks.yaml', function(
    err,
    stdout,
    stderr
  ) {
    if (err) {
      console.log(stderr);
      return;
    }
    fs.mkdir('tmp', function() {
      fs.writeFileSync('tmp/test.svg', stdout);
    });
  });
});

gulp.task('watch', function() {
  gulp.watch(['./cli.js', './src/**'], gulp.task('create_svg'));
});

/**
 * Lints all projects JavaScript files using ESLint. This includes frontend sour
ce code, as well as,
 * build scripts.
 */
gulp.task('lint-javascript', function() {
  return (
    gulp
      .src('src/**/*.js')
      // Attach lint output to the eslint property of the file.
      .pipe(gulpEslint())
      // Output the lint results to the console.
      .pipe(gulpEslint.format())
      // Exit with an error code (1) on a lint error.
      .pipe(gulpEslint.failOnError())
  );
});

/**
 * Checks whether project's JavaScript files are formatted according to clang-format style.
 */
gulp.task('check-javascript-format', function() {
  return gulp.src('src/**/*.js').pipe(
    gulpClangFormat.checkFormat('file', undefined, {
      verbos: true,
      fail: true
    })
  );
});

gulp.task(
  'check',
  gulp.series(gulp.parallel('lint-javascript', 'check-javascript-format'))
);

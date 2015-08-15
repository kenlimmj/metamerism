/*
 * @Author: Lim Mingjie, Kenneth
 * @Date:   2015-08-05 22:10:15
 * @Last Modified by:   Lim Mingjie, Kenneth
 * @Last Modified time: 2015-08-08 13:39:15
 */

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var flow = require('gulp-flowtype');

gulp.task('default', ['watch']);

gulp.task('js', function() {
  return gulp.src('src/js/*.js')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(flow())
    .pipe(babel({
      stage: 0,
      comments: false
    }))
    .pipe(concat('app.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('watch', function() {
  gulp.watch('src/js/*.js', ['js']);
});

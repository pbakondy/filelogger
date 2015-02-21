var gulp = require('gulp'),
  buildConfig = require('./config/build.config'),
  footer = require('gulp-footer'),
  header = require('gulp-header'),
  jshint = require('gulp-jshint'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename');

gulp.task('default', ['build']);

gulp.task('build', function () {
  gulp.src(buildConfig.pluginFiles)
    .pipe(header(buildConfig.closureStart))
    .pipe(footer(buildConfig.closureEnd))
    .pipe(header(buildConfig.banner))
    .pipe(gulp.dest(buildConfig.dist));

  return gulp.src(buildConfig.pluginFiles)
    .pipe(header(buildConfig.closureStart))
    .pipe(footer(buildConfig.closureEnd))
    .pipe(uglify())
    .pipe(header(buildConfig.banner))
    .pipe(rename({extname: '.min.js'}))
    .pipe(gulp.dest(buildConfig.dist));
});

gulp.task('lint', function () {
  return gulp.src('./src/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

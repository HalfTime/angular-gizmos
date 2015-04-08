/* jshint node: true */
'use strict';

var gulp = require('gulp'),
    g = require('gulp-load-plugins')({lazy: false}),
    noop = g.util.noop;
    //es = require('event-stream'),
    //bowerFiles = require('main-bower-files'),
    //rimraf = require('rimraf'),
    //queue = require('streamqueue'),
    //lazypipe = require('lazypipe'),
    //stylish = require('jshint-stylish'),
    //bower = require('./bower'),

var fs = require('fs');
var path = require('path');
var mergeStream = require('merge-stream');
var rimraf = require('rimraf');

// Adds tasks:
//   gulp bump
//   gulp bump --minor
//   gulp bump --major
require('gulp-release-tasks')(gulp);

function directories(dir) {
  return fs.readdirSync(dir)
    //.filter(function(file) {
      //console.log(file)
      //return fs.statSync(path.join(dir, file)).isDirectory();
    //});
}

function camelize(str) {
  return str.replace(/-(\w)/g, function(m, p1) {
    return p1.toUpperCase();
  });
}

gulp.task('default', ['dist', 'test'])


gulp.task('dist', [
  'clean',
  'dist.directives',
  'dist.scripts',
  'dist.scss',
  'dist.fonts',
])


gulp.task("clean", function () {
  rimraf.sync('dist')
})


gulp.task('dist.scss', function() {
  var glob = ['src/**/*.scss']

  return gulp.src(glob)
    .pipe(gulp.dest('dist'))
    .pipe(g.concat('angular-gizmos.scss'))
    .pipe(gulp.dest('dist'))
});


gulp.task('dist.fonts', function() {
  var glob = ['src/fonts/*']

  return gulp.src(glob)
    .pipe(gulp.dest('dist/fonts'))
});


gulp.task('dist.scripts', function() {
  var glob = [
    'src/scripts/**/*.js',
    '!src/scripts/**/*-test.js'
  ]

  return gulp.src(glob)
    .pipe(gulp.dest('dist'))
});


gulp.task('dist.directives', function() {
  var path = 'src/directives/'

  return mergeStream(directories(path).map(function(directory) {
    var jadeFilter = g.filter('**/*.jade')
    var jsFilter = g.filter('**/*.js')
    var scssFilter = g.filter('**/*.scss')
    var moduleName = 'gizmos.' + camelize(directory)

    return gulp.src(path + directory + '/*')
      .pipe(jadeFilter)
        .pipe(g.jade())
        .pipe(g.angularTemplatecache({
          module: moduleName,
          base: function(file) {
            return file.path.match(/.*\/(.+\.(html))/)[1]
          }
        }))
        .pipe(jadeFilter.restore())
      .pipe(jsFilter)
        .pipe(g.replace("!MODULE_NAME!", moduleName))
        .pipe(g.babel({ blacklist: ["useStrict"] }))
        .pipe(g.ngAnnotate())
        //.pipe(g.uglify())
        .pipe(g.concat(directory + '.js'))
        .pipe(gulp.dest('dist/directives/' + directory))
   }));
});


gulp.task('release', ['dist'], function() {
  var glob = ['dist/**/*.js']

  return gulp.src(glob)
    .pipe(g.print())
    .pipe(g.concat('angular-gizmos.js'))
    .pipe(gulp.dest('dist'))
})


gulp.task('test', function(done) {
  var glob = [
    'bower_components/lodash/lodash.js',
    'src/scripts/**/*',
    'src/**/*-test.js'
  ]

  gulp.src(glob)
    .pipe(g.karma({ configFile: 'karma.conf.js', action: 'run' }, done))
    .on('error', g.util.log)
})


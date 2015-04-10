/* jshint node: true */
'use strict';

var gulp = require('gulp');
var g = require('gulp-load-plugins')({lazy: false});

var fs = require('fs');
var runSequence = require('run-sequence');
var mergeStream = require('merge-stream');
var rimraf = require('rimraf');

// Adds tasks https://github.com/lfender6445/gulp-release-tasks
//   gulp tag
//   gulp tag --minor
//   gulp tag --major
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

gulp.task('default', ['watch', 'test.watch'])

gulp.task('dist', function(done) {
  runSequence(
    'clean',
    ['dist.modules', 'dist.directives', 'dist.filters', 'dist.services', 'dist.miscScripts', 'dist.scss', 'dist.fonts'],
    'dist.concat',
    done
  )
})


gulp.task('clean', function () {
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


gulp.task('dist.modules', function() {
  var glob = 'src/**/_module.js'
  return gulp.src(glob)
    .pipe(gulp.dest('dist'))
});

gulp.task('dist.filters', function() {
  var glob = 'src/filters/**/!(*-test).js'
  return gulp.src(glob)
    .pipe(gulp.dest('dist'))
});

gulp.task('dist.services', function() {
  var glob = 'src/services/**/!(*-test).js'
  return gulp.src(glob)
    .pipe(gulp.dest('dist'))
});

gulp.task('dist.miscScripts', function() {
  var glob = 'src/scripts/**/!(*-test).js'
  return gulp.src(glob)
    .pipe(gulp.dest('dist'))
});


gulp.task('dist.directives', function() {
  var path = 'src/directives/'

  return mergeStream(directories(path).map(function(directory) {
    var jadeFilter = g.filter('**/*.jade')
    var jsFilter = g.filter('**/!(*-test).js')
    //var scssFilter = g.filter('**/*.scss')
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
        .pipe(g.babel({ blacklist: ['useStrict'] }))
        .pipe(g.ngAnnotate())
        //.pipe(g.uglify())
        .pipe(g.concat(directory + '.js'))
        .pipe(gulp.dest('dist/directives/' + directory))
   }));
});


gulp.task('dist.concat', function() {
  var glob = ['dist/**/*.js']

  return gulp.src(glob)
    //.pipe(g.print())
    .pipe(g.concat('angular-gizmos.js'))
    .pipe(gulp.dest('dist'))
})


function runKarma( action, done ) {
  var glob = [
    // libs
    'bower_components/lodash/lodash.js',
    'bower_components/jquery/dist/jquery.js',
    'bower_components/angular/angular.js',
    // test libs
    'bower_components/angular-mocks/angular-mocks.js',
    // implementations
    'src/**/_module.js',
    'src/scripts/**/*',
    'src/**/!(*-test).js',
    // tests
    'test/helpers.js',
    'src/**/*-test.js',
  ]

  return gulp.src(glob)
    .pipe(g.karma({ configFile: 'karma.conf.js', action: action }, done))
    .on('error', g.util.log)
}

gulp.task('test', function(done) {
  return runKarma('run', done)
})

gulp.task('test.watch', function(done) {
  return runKarma('watch', done)
})

gulp.task('watch', ['dist'], function() {
  gulp.watch('src/**/*', ['dist'])
})



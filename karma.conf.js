module.exports = function ( karma ) {
  process.env.PHANTOMJS_BIN = 'node_modules/karma-phantomjs-launcher/node_modules/.bin/phantomjs';

  karma.set({
    // Filled by the task `gulp karma-conf`
    files: [],
    basePath: './',
    frameworks: ['jasmine'],
    reporters: 'progress',
    autoWatch: true,
    singleRun: false,
    colors: true,
    port: 9099,
    runnerPort: 9100,
    urlRoot: '/',
    browsers: [
      'PhantomJS'
    ],
    preprocessors: {
      '{src,test}/**/*.js': ['babel'],
      'src/**/*.jade': ['jade', 'ng-html2js'],
    }
  });
};

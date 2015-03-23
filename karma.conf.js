module.exports = function ( karma ) {
  process.env.PHANTOMJS_BIN = 'node_modules/karma-phantomjs-launcher/node_modules/.bin/phantomjs';

  karma.set({
    basePath: './',

    /**
     * Filled by the task `gulp karma-conf`
     */
    files: [
    ],

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
    ]
  });
};

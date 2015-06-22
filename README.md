angular-gizmos
============


## Development

First let's check out this project with:

```bash
  git clone https://github.com/HalfTime/angular-gizmos.git
```

To start developing in the project run, first grab the bower dependencies:

```bash
  bower install
```

then

```bash
gulp
```

Then head to `http://localhost:3000` in your browser.

The `serve` tasks starts a static file server, which serves the AngularJS application, and a watch task which watches all files for changes and lints, builds and injects them into the index.html accordingly.

## Tests

To run tests run:

```bash
gulp test
```

**Or** first inject all test files into `karma.conf.js` with:

```bash
gulp karma-conf
```

Then you're able to run Karma directly. Example:

```bash
karma start --single-run
```

## Production ready build - a.k.a. dist

To make the app ready for deploy to production run:

```bash
gulp dist
```

Now there's a `./dist` folder with all scripts and stylesheets concatenated and minified, also third party libraries installed with bower will be concatenated and minified into `vendors.min.js` and `vendors.min.css` respectively.

## Todo

- [ ] move over grab-bag stuff
- [ ] update readme
- [ ] add gulp bump task
- [ ] cleanup dist / release task
- [ ] rename topic ring => level ring
- [ ] include parts of gulpfile
- [ ] include git commit message hooks

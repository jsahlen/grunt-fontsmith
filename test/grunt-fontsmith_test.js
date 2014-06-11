var fs = require('fs');
var exec = require('child_process').exec;
var expect = require('chai').expect;
var rimraf = require('rimraf');
var shellQuote = require('shell-quote').quote;
var cssUtils = require('./utils/css');
var fsUtils = require('./utils/fs');
var imageUtils = require('./utils/image');

function runGruntTask(task) {
  before(function (done) {
    // Bump the timeout for fontsmith
    this.timeout(60000);

    // Relocate to test directory
    process.chdir(__dirname);

    // Execute the cmd and task combination
    var that = this;
    exec(shellQuote(['grunt', task]), function (err, stdout, stderr) {
      // If there was an error, show me the output
      if (err) {
        console.log(stdout, stderr);
      }

      // Fallback error
      if (stderr) {
        err = new Error(stderr);
      }

      // Save results for later
      that.stdout = stdout;
      // console.log(stdout);

      // Callback
      done(err);
    });
  });
}

// DEV: If you want to develop against this, disable the `rimraf` and `runGruntTask's`

// Clean up actual directory
before(function cleanActualFiles (done) {
  rimraf(__dirname + '/actual_files/', done);
});

describe('A set of SVGs', function () {
  describe('processed into a single font and stylesheet', function () {
    // Run our grunt task
    runGruntTask('font:single');

    // Compare CSS
    fsUtils.loadActualLines(__dirname + '/actual_files/single/font.styl');
    fsUtils.loadExpectedLines(__dirname + '/expected_files/single/font.styl');
    it('produces a stylesheet', function () {
      // Determine how many lines are different
      var actualLines = this.actualLines;
      var differentLines = this.expectedLines.filter(function (line) {
        return actualLines.indexOf(line) === -1;
      });

      // Assert that only the character lines are different
      expect(differentLines.length).to.be.at.most(3);
    });

    // Generate actual and expected screenshots
    imageUtils.screenshotStylus({
      cssFilepath: __dirname + '/actual_files/single/font.styl',
      fontFilepath: __dirname + '/actual_files/single/font.svg',
      fontFormat: 'svg',
      screenshotPath: __dirname + '/actual_files/single/actual.png'
    });
    imageUtils.screenshotStylus({
      cssFilepath: __dirname + '/expected_files/single/font.styl',
      fontFilepath: __dirname + '/expected_files/single/font.svg',
      fontFormat: 'svg',
      screenshotPath: __dirname + '/actual_files/single/expected.png'
    });
    imageUtils.diff({
      actualImage: __dirname + '/actual_files/single/actual.png',
      expectedImage: __dirname + '/actual_files/single/expected.png',
      diffImage: __dirname + '/actual_files/single/diff.png'
    });
    it('produces a font', function () {
      expect(this.imagesAreSame).to.equal(true);
    });
  });

  describe('processed into multiple fonts and stylesheets', function () {
    // Run our grunt task
    runGruntTask('font:multiple');

    // Compare Stylus and JSON
    fsUtils.loadActualLines(__dirname + '/actual_files/multiple/font.styl');
    fsUtils.loadExpectedLines(__dirname + '/expected_files/multiple/font.styl');
    it('produces a Stylus stylesheet', function () {
      // Determine how many lines are different
      var actualLines = this.actualLines;
      var differentLines = this.expectedLines.filter(function (line) {
        return actualLines.indexOf(line) === -1;
      });

      // Assert that only the character lines are different
      expect(differentLines.length).to.be.at.most(3);
    });
    fsUtils.loadActualLines(__dirname + '/actual_files/multiple/font.json');
    fsUtils.loadExpectedLines(__dirname + '/expected_files/multiple/font.json');
    it('produces a JSON stylesheet', function () {
      // Determine how many lines are different
      var actualLines = this.actualLines;
      var differentLines = this.expectedLines.filter(function (line) {
        return actualLines.indexOf(line) === -1;
      });

      // Assert that only the character lines are different
      expect(differentLines.length).to.be.at.most(3);
    });

    // Generate actual and expected screenshots
    // DEV: This is an anti-pattern since it destroys our stack trace
    // DEV: PhantomJS does not support testing of `eot` so this only validates CSS
    ['svg', 'ttf', 'eot', 'woff'].forEach(function (fontFormat) {
      describe('when rendering on a ' + fontFormat + ' supported browser', function () {
        imageUtils.screenshotStylus({
          cssFilepath: __dirname + '/actual_files/multiple/font.styl',
          fontFilepath: __dirname + '/actual_files/multiple/font.' + fontFormat,
          fontFormat: fontFormat,
          screenshotPath: __dirname + '/actual_files/multiple/actual.' + fontFormat + '.png'
        });
        imageUtils.screenshotStylus({
          cssFilepath: __dirname + '/expected_files/multiple/font.styl',
          fontFilepath: __dirname + '/expected_files/multiple/font.' + fontFormat,
          fontFormat: fontFormat,
          screenshotPath: __dirname + '/actual_files/multiple/expected.' + fontFormat + '.png'
        });
        imageUtils.diff({
          actualImage: __dirname + '/actual_files/multiple/actual.' + fontFormat + '.png',
          expectedImage: __dirname + '/actual_files/multiple/expected.' + fontFormat + '.png',
          diffImage: __dirname + '/actual_files/multiple/diff.' + fontFormat + '.png'
        });
        it('render a(n) ' + fontFormat + ' font', function () {
          expect(this.imagesAreSame).to.equal(true);
        });
      });
    });
  });

  describe('processed into overridden fonts and stylesheets', function () {
    // Run our grunt task
    runGruntTask('font:overrides');

    // Compare Stylus and JSON
    fsUtils.loadActualLines(__dirname + '/actual_files/overrides/jason.less');
    fsUtils.loadExpectedLines(__dirname + '/expected_files/overrides/jason.less');
    it('produces JSON under a .less file', function () {
      // Determine how many lines are different
      var actualLines = this.actualLines;
      var differentLines = this.expectedLines.filter(function (line) {
        return actualLines.indexOf(line) === -1;
      });

      // Assert that only the character lines are different
      expect(differentLines.length).to.be.at.most(3);
    });
    fsUtils.loadActualLines(__dirname + '/actual_files/overrides/styleee.json');
    fsUtils.loadExpectedLines(__dirname + '/expected_files/overrides/styleee.json');
    it('produces a Stylus stylesheet under a .json file', function () {
      // Determine how many lines are different
      var actualLines = this.actualLines;
      var differentLines = this.expectedLines.filter(function (line) {
        return actualLines.indexOf(line) === -1;
      });

      // Assert that only the character lines are different
      expect(differentLines.length).to.be.at.most(3);
    });

    // Generate actual and expected screenshots
    // DEV: This is an anti-pattern since it destroys our stack trace
    // DEV: PhantomJS does not support testing of `eot` so this only validates CSS
    [{
      filename: 'waffles.ttf',
      format: 'woff'
    }, {
      filename: 'essveegee.eot',
      format: 'svg'
    }].forEach(function (font) {
      describe('when rendering on a ' + font.format + ' supported browser', function () {
        imageUtils.screenshotStylus({
          cssFilepath: __dirname + '/actual_files/overrides/styleee.json',
          fontFilepath: __dirname + '/actual_files/overrides/' + font.filename,
          fontFormat: font.format,
          fontNames: {
            svg: 'essveegee.eot',
            woff: 'waffles.ttf'
          },
          screenshotPath: __dirname + '/actual_files/overrides/actual.' + font.filename + '.png'
        });
        imageUtils.screenshotStylus({
          cssFilepath: __dirname + '/expected_files/overrides/styleee.json',
          fontFilepath: __dirname + '/expected_files/overrides/' + font.filename,
          fontFormat: font.format,
          fontNames: {
            svg: 'essveegee.eot',
            woff: 'waffles.ttf'
          },
          screenshotPath: __dirname + '/actual_files/overrides/expected.' + font.filename + '.png'
        });
        imageUtils.diff({
          actualImage: __dirname + '/actual_files/overrides/actual.' + font.filename + '.png',
          expectedImage: __dirname + '/actual_files/overrides/expected.' + font.filename + '.png',
          diffImage: __dirname + '/actual_files/overrides/diff.' + font.filename + '.png'
        });
        it('render a(n) ' + font.format + ' font', function () {
          expect(this.imagesAreSame).to.equal(true);
        });
      });
    });
  });
});

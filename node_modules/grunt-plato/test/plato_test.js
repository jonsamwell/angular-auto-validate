'use strict';

var fs = require('fs'),
    path = require('path');

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.plato = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },

  // really shallow test to see if the task generated output for each config
  testOutputStructure: function(test) {

    var tmp = 'tmp';

    var platoRuns = Object.keys(grunt.config('plato'));

    test.expect(platoRuns.length * 5);

    platoRuns.forEach(function(outputDir){
      test.ok(fs.existsSync(path.join(tmp, outputDir, 'index.html')));
      test.ok(fs.existsSync(path.join(tmp, outputDir, 'report.js')));
      test.ok(fs.existsSync(path.join(tmp, outputDir, 'report.json')));
      test.ok(fs.existsSync(path.join(tmp, outputDir, 'files')));
      test.ok(fs.existsSync(path.join(tmp, outputDir, 'assets')));
    });

    console.log();
    test.done();
  },
};

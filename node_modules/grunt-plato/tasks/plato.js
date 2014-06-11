/*
 * grunt-plato
 * https://github.com/jsoverson/grunt-plato
 *
 * Copyright (c) 2013 Jarrod Overson
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var plato = require('plato');

  grunt.registerMultiTask('plato', 'Generate static analysis charts with plato', function() {

    var options = this.options({
      jshint: {},
      complexity: {
        newmi : true
      }
    });

    if (options.jshint && !options.jshint.options) {
      options.jshint = {
        options : options.jshint,
        globals : options.jshint.globals || {}
      };
      delete options.jshint.options.globals;
    }

    var done = this.async();

    plato.inspect(this.filesSrc, this.files[0].dest, options, function(){
      done();
    });

  });

};

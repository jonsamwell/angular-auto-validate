/*
 * grunt-plato
 * https://github.com/joverson/grunt-plato
 *
 * Copyright (c) 2013 Jarrod Overson
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/**/*.js',
        'test/**/*.js',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    plato: {
      default_options: {
        files: {
          'tmp/default_options': ['tasks/**/*.js', 'test/**/*.js'],
        },
      },
      custom_complexity: {
        options : {
          jshint : false,
          complexity : {
            logicalor : false,
            switchcase : false,
            forin : true,
            trycatch : true
          }
        },
        files: {
          'tmp/custom_complexity': ['tasks/**/*.js', 'test/**/*.js'],
        },
      },
      custom_jshintrc: {
        options : {
          jshint : grunt.file.readJSON('.jshintrc')
        },
        files: {
          'tmp/custom_jshintrc': ['tasks/**/*.js', 'test/**/*.js'],
        },
      },
      no_jshintrc: {
        options : {
          jshint : false
        },
        files: {
          'tmp/no_jshintrc': ['tasks/**/*.js', 'test/**/*.js'],
        },
      },
    },
    nodeunit: {
      files: ['test/**/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['jshint', 'clean', 'plato', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};

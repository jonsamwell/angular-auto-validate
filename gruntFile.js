(function (module) {
    'use strict';

    module.exports = function (grunt) {
        // These variable would be passed in from the master build file.
        var target = grunt.option('target') || 'staging',
            version = grunt.option('product_version') || 'version_not_set';

        // config
        grunt.initConfig({
            // Configuration Paths
            rootfolder: './',
            distfolder: '<%= rootfolder %>/dist/',
            srcfolder: '<%= rootfolder %>/src/',
            demofolder: '<%= rootfolder %>/demo/',
            vendorfolder: '<%= rootfolder %>/bower_components/',
            testsfolder: '<%= rootfolder %>/tests/',
            dist: {
                root: '<%= distfolder %>',
            },

            // Style Checks
            jshint: {
                files: ['<%= srcfolder %>**/*.js', '<%= testsfolder %>**/*.spec.js'],
                options: {
                    jshintrc: '.jshintrc'
                }
            },

            // Code Cleanup for JS & HTML
            jsbeautifier: {
                files: ["<%= srcfolder %>**/*.js", '<%= testfolder %>**/*.spec.js', '<%= srcfolder %>**/*.html', '<%= srcfolder %>index.html'],
                options: {
                    html: {
                        braceStyle: "collapse",
                        indentChar: " ",
                        indentScripts: "keep",
                        indentSize: 2,
                        maxPreserveNewlines: 10,
                        preserveNewlines: true,
                        unformatted: ["a", "sub", "sup", "b", "i", "u"],
                        wrapLineLength: 0
                    },
                    js: {
                        braceStyle: "collapse",
                        breakChainedMethods: false,
                        e4x: false,
                        evalCode: false,
                        indentChar: " ",
                        indentLevel: 0,
                        indentSize: 4,
                        indentWithTabs: false,
                        jslintHappy: true,
                        keepArrayIndentation: false,
                        keepFunctionIndentation: false,
                        maxPreserveNewlines: 10,
                        preserveNewlines: true,
                        spaceBeforeConditional: true,
                        spaceInParen: false,
                        unescapeStrings: false,
                        wrapLineLength: 0
                    }
                }
            },

            // LESS to CSS preprocessor
            less: {
                demo: {
                    options: {
                        paths: ['<%= demofolder %>less/', '<%= vendorfolder %>lesshat/build/'],
                        cleancss: true,
                        ieCompat: true,
                        strictImports: true
                    },
                    files: {
                        "<%= demofolder %>less/all.css": "<%= demofolder %>less/all.less"
                    }
                }
            },

            // Unit Testing
            karma: {
                unit: {
                    configFile: 'tests/karma.conf.unit.js'
                },
                debug: {
                    configFile: 'tests/karma.conf.unit.debug.js'
                },
                release: {
                    configFile: 'tests/karma.conf.unit.release.js'
                }
            },

            // HTTP(S) development server
            connect: {
                devserver: {
                    options: {
                        hostname: '*',
                        port: 8020,
                        protocol: 'http',
                        useAvailablePort: true,
                        base: '',
                        open: true,
                        keepalive: true // setting this to true means this task is blocking
                    }
                }
            },

            clean: {
                dist: {
                    files: [{
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= dist.root %>/**/*.*'
                        ]
                    }],
                    options: {
                        force: true
                    }
                }
            },

            copy: {
            },

            uglify: {
                options: {
                    sourceMap: false,
                    sourceMapIncludeSources: true,
                    preserveComments: false,
                    compress: {
                        drop_console: true,
                        global_defs: {
                            "DEBUG": false
                        },
                        dead_code: true
                    }
                }
            },

            plato: {
                analysis: {
                    options : {
                        title: 'AnguarJS Auto-Validate Complexity Report',
                        jshint : grunt.file.readJSON('.jshintrc')
                    },
                    files: {
                        'tests/reports/complexity': ['src/**/*.js']
                    }
                }
            }

        });

        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-jsbeautifier');
        grunt.loadNpmTasks('grunt-karma');
        grunt.loadNpmTasks('grunt-contrib-connect');
        grunt.loadNpmTasks('grunt-contrib-clean');
        grunt.loadNpmTasks('grunt-contrib-copy');
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-contrib-less');
        grunt.loadNpmTasks('grunt-plato');

        // Create Custom Tasks
        grunt.registerTask('default', [
            'jsbeautifier',
            'jshint',
            'less:demo',
            'karma:unit',
            'plato:analysis'
        ]);
    };
}(module));
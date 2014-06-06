var shared = require('./karma.conf.shared.js');

module.exports = function(config) {
    'use strict';
    shared(config);

    config.files = shared.files.concat([
        'bower_components/angular-mocks/angular-mocks.js',
        'tests/**/*.spec.js'
    ]);
};
# grunt-plato

> Task to generate static analysis reports via plato

For more information on plato, see the [docs](https://github.com/es-analysis/plato) and [some](http://es-analysis.github.com/plato/examples/marionette/) [example](http://es-analysis.github.com/plato/examples/jquery/) [reports](http://es-analysis.github.com/plato/examples/grunt/)

## Getting Started
_If you haven't used [grunt][] before, be sure to check out the [Getting Started][] guide._

From the same directory as your project's [Gruntfile][Getting Started] and [package.json][], install this plugin with the following command:

```bash
npm install grunt-plato --save-dev
```

Once that's done, add this line to your project's Gruntfile:

```js
grunt.loadNpmTasks('grunt-plato');
```

[grunt]: http://gruntjs.com/
[Getting Started]: https://github.com/gruntjs/grunt/blob/devel/docs/getting_started.md
[package.json]: https://npmjs.org/doc/json.html

## Overview
In your project's Gruntfile, add a section named `plato` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  plato: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
})
```

## Options

### options.jshint
Type: `Object`
Default value: unset

A jshintrc style object specifying jshint options, see [JSHint docs](http://www.jshint.com/docs/)

### options.complexity
Type: `Object`
Default value: unset

A series of options passed to complexity-report, see [Phil Booth's complexity-report](https://github.com/philbooth/complexityReport.js)

## Usage Examples

### Using Default Options

```js
grunt.initConfig({
  plato: {
    your_task: {
      files: {
        'report/output/directory': ['src/**/*.js', 'test/**/*.js'],
      }
    },
  },
})
```

### Custom complexity options

```js
plato: {
  your_task: {
    options : {
      complexity : {
        logicalor : false,
        switchcase : false,
        forin : true,
        trycatch : true
      }
    },
    files: {
      'reports': ['src/**/*.js'],
    },
  }
}
```

### Using a .jshintrc file

```js
plato: {
  your_task: {
    options : {
      jshint : grunt.file.readJSON('.jshintrc')
    },
    files: {
      'reports': ['src/**/*.js'],
    },
  },
}
```

### Disabling jshint reporting

```js
plato: {
  your_task: {
    options : {
      jshint : false
    },
    files: {
      'reports': ['src/**/*.js'],
    },
  },
}
```

### Excluding files matching a specific regexp

```js
plato: {
  your_task: {
    options : {
      exclude: /\.min\.js$/    // excludes source files finishing with ".min.js"
    },
    files: {
      'reports': ['src/**/*.js'],
    },
  },
}
```


## Release History

 - 0.2.1 bumped for plato 0.6.0
 - 0.2.0 bumped for plato 0.5.0
 - 0.1.5 updating deps for grunt 0.4.0 final
 - 0.1.4 defaulting to new maintainability index
 - 0.1.3 updated dependencies
 - 0.1.2 updated for grunt 0.4.0rc5
 - 0.1.1 removed debug output
 - 0.1.0 initial release

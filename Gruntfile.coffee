LIVERELOAD_PORT = 35730
lrSnippet = require('connect-livereload') { port: LIVERELOAD_PORT }
mountFolder = (connect, dir) ->
  connect.static require('path').resolve dir

pushState = require('grunt-connect-pushstate/lib/utils').pushState

module.exports = (grunt) ->
  require('matchdep').filterDev('grunt-*').forEach grunt.loadNpmTasks

  grunt.initConfig
    # having a hard time figuring out how to get the js to load in order, so manually declaring it here
    # this is a pain in the ass, update asap
    tusk_coffee:
      vendor:
        options:
          wrap: null
          runtime: false
        files:
          'public/javascripts/vendor.js': [
            'vendor/javascripts/common.js'
            'vendor/javascripts/underscore.js'
            'vendor/javascripts/jquery.js'
            'vendor/javascripts/moduleLibrary.js'
            'vendor/javascripts/EventBus.js'
            'vendor/javascripts/gamecore.js'
            'vendor/javascripts/rng.js'
            'vendor/javascripts/easel.js'
            'vendor/javascripts/tween.js'
            'vendor/javascripts/astar.js'
            'vendor/javascripts/state-machine.js'
            'vendor/javascripts/Scroller.js'
          ]
          'public/test/unit/javascripts/unit-tests-vendor.js': [
            'test/unit/vendor/javascripts/mocha.js'
            'test/unit/vendor/javascripts/chai.js'
            'test/unit/vendor/javascripts/sinon.js'
            'test/unit/vendor/javascripts/sinon-chai.js'
            'test/unit/vendor/javascripts/mochaCov.js'
            'test/unit/vendor/javascripts/mochaTestHelper.js'
          ]
          'public/test/integration/javascripts/integration-tests-vendor.js': [
            'test/integration/vendor/javascripts/mocha.js'
            'test/integration/vendor/javascripts/chai.js'
            'test/integration/vendor/javascripts/sinon.js'
            'test/integration/vendor/javascripts/sinon-chai.js'
            'test/integration/vendor/javascripts/mochaCov.js'
            'test/integration/vendor/javascripts/mochaTestHelper.js'
          ]
      app:
        options:
          wrap: 'CommonJS'
          modulesRoot: 'app'
          runtime: false
        files:
          'public/javascripts/app.js': ['app/**/*.coffee']
      unit:
        options:
          wrap: 'CommonJS'
          runtime: false
        files:
          'public/test/unit/javascripts/unit-tests.js': ['test/unit/**/*.coffee']
      integration:
        options:
          wrap: 'CommonJS'
          runtime: false
        files:
          'public/test/integration/javascripts/integration-tests.js': ['test/integration/**/*.coffee']

    less:
      dist:
        options:
          paths: ['app/stylesheets']
        files:
          'public/stylesheets/app.css': 'app/stylesheets/**/*.less'

    watch:
      options:
        nospawn: true
        livereload: LIVERELOAD_PORT
      livereload:
        files: [
          'app/assets/**/*.html'
          'test/unit/assets/**/*.html'
          'app/**/*.coffee'
          'test/unit/**/*.coffee'
          'app/**/*.styl'
          'app/**/*.hbs'
          'app/**/*.less'
        ]
        tasks: ['build']

    cssmin:
      combine:
        files:
          'public/stylesheets/vendor.css': ['vendor/stylesheets/*.css']
          'public/test/unit/stylesheets/test.css': ['test/unit/vendor/stylesheets/*.css']
          'public/test/integration/stylesheets/integration.css': ['test/integration/vendor/stylesheets/*.css']

    mocha:
      unit: ['public/test/unit/index.html']
      integration: ['public/test/integration/index.html']

    blanket:
      instrument:
        files:
          'public/test/unit/javascripts/': ['public/javascripts/']
          'public/test/integration/javascripts/': ['public/javascripts/']

    coffee:
      app:
        options:
          bare: true
        expand: true
        flatten: false
        cwd: 'app/'
        src: ['**/*.coffee']
        dest: 'public/raw-javascripts/'
        ext: '.js'

    commonjs:
      modules:
        cwd: 'public/raw-javascripts/'
        src: ['**/*.js']
        dest: 'public/javascripts/'

    clean:
      build: [
        'public'
        'docs'
      ]
      integration: [
        'public/test/integration'
      ]

    connect:
      options:
        port: 3334
        hostname: '0.0.0.0'
        base: 'public'
      livereload:
        middlewear: (connect) ->
          [pushState, lrsnippet, mountFolder(connect, '.')]

    open:
      server:
        path: 'http://localhost:<%= connect.options.port %>'

    copy:
      main:
        files: [
          {expand: true, cwd: 'app/assets/', src: ['**'], dest: 'public'}
          {expand: true, cwd: 'app/assets/images', src: ['**'], dest: 'public/test/images'}
          {expand: true, cwd: 'vendor/fonts', src: ['**'], dest: 'public/fonts'}
          {expand: true, cwd: 'vendor/images', src: ['**'], dest: 'public/images'}
          {expand: true, src: ['test/unit/assets/*'], dest: 'public/test/unit', flatten: true}
          {expand: true, src: ['test/integration/assets/*'], dest: 'public/test/integration', flatten: true}
        ]
      integration:
        files: [
          {expand: true, cwd: 'app/assets/images', src: ['**'], dest: 'public/test/integration/images'}
          {expand: true, src: ['test/integration/assets/*'], dest: 'public/test/integration', flatten: true}
        ]

    docco:
      coffee:
        options:
          output: 'public/docs/'
          seperator: '_'
          cwd: 'app'
        src: ['app/**/*.coffee']

  grunt.registerTask 'live', ['build', 'connect:livereload', 'watch']
  grunt.registerTask 'build', ['deploy']#, 'test:unit']
  grunt.registerTask 'deploy', ['clean:build', 'coffee', 'commonjs', 'tusk_coffee', 'less', 'cssmin', 'docs', 'copy:main']
  grunt.registerTask 'test:unit', ['blanket', 'mocha:unit']
  grunt.registerTask 'test:integration', ['clean:integration', 'tusk_coffee', 'less', 'cssmin', 'copy:integration', 'blanket', 'mocha:integration']
  grunt.registerTask 'docs', []#'docco']

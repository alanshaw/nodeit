module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    
    browserify: {
      dist: {
        files: {
          "js/bundle.js": "js/main.js"
        }
      }
    },
    
    watch: {
      js: {
        options: {atBegin: true},
        files: ["{js,lib}/**/*.js", "!js/bundle.js"],
        tasks: ["browserify"]
      }
    },
  
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: 'lib',
          //themedir: 'path/to/custom/theme/',
          outdir: 'doc/'
        }
      }
    },
    
    "gh-pages": {
      doc : {
        src: ["doc/**"]
      }
    }
  })

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks("grunt-browserify")
  grunt.loadNpmTasks("grunt-contrib-watch")
  grunt.loadNpmTasks("grunt-contrib-yuidoc")
  grunt.loadNpmTasks("grunt-gh-pages")

  // Default task(s).
  grunt.registerTask("default", ["browserify"])
  grunt.registerTask("publish-docs", ["yuidoc", "gh-pages"])
}
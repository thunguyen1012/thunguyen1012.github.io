module.exports = function(grunt) {
  grunt.initConfig({
    cssmin: {
      dist: {
        files: [
          { src: 'css/theme.css', dest: 'css/theme.min.css' },
          { src: 'css/theme-dark.css', dest: 'css/theme-dark.min.css' },
          {
            src: 'css/highlight/railscasts.css',
            dest: 'css/highlight/railscasts.css'
          }
        ]
      }
    }
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default tasks.
  grunt.registerTask('default', ['cssmin']);
};

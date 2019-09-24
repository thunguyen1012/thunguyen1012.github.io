module.exports = function(grunt) {
  grunt.initConfig({
    cssmin: {
      dist: {
        files: [
            { src: 'css/theme.css', dest: 'css/theme.css' },
            { src: 'css/theme-dark.css', dest: 'css/theme-dark.css' }
        ]
      }
    }
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default tasks.
  grunt.registerTask('default', ['cssmin']);
};

module.exports = function (grunt) {
  grunt.initConfig({
      uncss: {
          dist: {
              files: [
                  { src: 'index.html', dest: 'css/theme.css' }
              ]
          }
      },
      cssmin: {
          dist: {
              files: [
                  { src: 'css/theme.css', dest: 'css/theme.css' }
              ]
          }
      }
  });

  // Load the plugins
  grunt.loadNpmTasks('grunt-uncss');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  // Default tasks.
  grunt.registerTask('default', ['uncss', 'cssmin']);
};
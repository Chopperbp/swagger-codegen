var shell = require('gulp-shell')

module.exports = {
	function generate(options) {
	  return shell.task('java swagger-codegen-cli.jar generate -i ' +options.input+ '-l '+options.language+' -o '+options.output, {
		env: { PATH: process.env.PATH + ';'+options.javaBin },
	   });
	}	
}
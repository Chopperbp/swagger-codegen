var fs = require('fs')
var path = require('path')
var childProcess = require('child_process')


try {
  exports.path = path.resolve(__dirname, require('./location').location)
} catch (e) {
  // Must be running inside install script.
  exports.path = null
}

// Make sure the binary is executable.  For some reason doing this inside
// install does not work correctly, likely due to some NPM step.
if (exports.path) {
  try {
    // avoid touching the binary if it's already got the correct permissions
    var st = fs.statSync(exports.path);
    var mode = st.mode | 0555;
    if (mode !== st.mode) {
      fs.chmodSync(exports.path, mode);
    }
  } catch (e) {
    // Just ignore error if we don't have permission.
    // We did our best. Likely because phantomjs was already installed.
  }
}

exports.generate = function (swagger, type, output) {
  var javaPath = process.env.JAVA_HOME;
  if (!javaPath) {
    console.error("Java not installed, JAVA_HOME is empty")
    process.exit(1);
  }

  var javabin = path.join(javaPath, 'bin', 'java')
  var childArgs = [
    '-jar',
    exports.path,
    'generate',
    '-i',
    swagger,
    '-l',
    type,
    '-o',
    output
  ];
  childProcess.execFile(javabin, childArgs, function (err, stdout, stderr) {
    if (err) {
      console.log(err);
    }
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.log(stderr);
    }
  })
}
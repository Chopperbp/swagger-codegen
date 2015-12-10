'use strict'

// If the process exits without going through exit(), then we did not complete.
var validExit = false
var kew = require('kew')
var path = require('path')
var fs = require('fs-extra')
var fso = require('fs')
var request = require('request')
var requestProgress = require('request-progress')
var Progress = require('progress')

var libPath = path.join(__dirname, 'lib')
var pkgPath = path.join(libPath, 'swagger-codegen-cli')

process.on('exit', function () {
    if (!validExit) {
        console.log('Install exited unexpectedly')
        exit(1)
    }
})

kew.resolve(true)
    .then(trySwaggerCodegenInLib)
    .then(downloadSwaggerCodegen)
    .then(function (val) {
        console.log('filepath: ' + val);
        var location = path.join(pkgPath, 'swagger-codegen-cli-2.1.4.jar');
        var relativeLocation = path.relative(libPath, location);
        writeLocationFile(relativeLocation);
        console.log('Done. swagger-codegen install binary available at', pkgPath)
        exit(0)
    })
    .fail(function (err) {
        console.error('swagger-codegen install error', err, err.stack)
        exit(1)
    });

/**
 * Check to see if the binary in lib is OK to use. If successful, exit the process.
 */
function trySwaggerCodegenInLib() {
    return kew.fcall(function () {
        var lib = path.join(libPath, 'location.js');
        var liblock ='C:\\Dgital\\Project\\swagger-codegen\\Test\\node_modules\\swagger-codegen\\lib\\location.js';
        var file = fso.existsSync(liblock);
        console.log('lib: ' + liblock +' exists: '+file)
        var libModule = require(lib)
        if (libModule.location) {
            console.log('swagger-codegen is previously installed at ' + libModule.location)
            exit(0)
        }
    }).fail(function (e) {
        //console.log("errror:" + e)
        // silently swallow any errors
    })
}

function downloadSwaggerCodegen() {
    var deferred = kew.defer()

    var downloadUrl = 'http://central.maven.org/maven2/io/swagger/swagger-codegen-cli/2.1.4/swagger-codegen-cli-2.1.4.jar'
    console.log("Downloading... " + downloadUrl)

    fs.mkdirsSync(pkgPath, '0777')
    var filepath = path.join(pkgPath, 'swagger-codegen-cli-2.1.4.jar');
    var bar = null;
    console.log('')
    requestProgress(request(downloadUrl))
        .on('progress', function (state) {
            if (!bar) {
                bar = new Progress('  [:bar] :percent :eta', { total: state.total, width: 40 })
            }
            bar.curr = state.received
            bar.tick(0)
        })
        .on('error', function (err) {
            // Do something with err 
        })
        .on('end', function () {
            console.log('')
            deferred.resolve(filepath);
        })
        .pipe(fs.createWriteStream(filepath));
    return deferred.promise
}

function writeLocationFile(location) {
    console.log('Writing location.js file')
    location = location.replace(/\\/g, '\\\\')
    var contents = 'module.exports.location = "' + location + '"\n'
    fs.writeFileSync(path.join(libPath, 'location.js'), contents)
}

function exit(code) {
    validExit = true
    process.exit(code || 0)
}
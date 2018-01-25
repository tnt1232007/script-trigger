var path = require('path');
module.paths.push(path.resolve('node_modules'));

window.fs = require('fs');
window.powershell = require('node-powershell');
window.fswrapper = require('chokidar');
window.jsonwrapper = require('jsonfile');
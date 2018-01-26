window.shell = require('electron').shell;
window.os = require('os');
window.fs = require('fs');
window.path = require('path');
module.paths.push(window.path.resolve('node_modules'));

window.powershell = require('node-powershell');
window.fswrapper = require('chokidar');
window.jsonwrapper = require('jsonfile');
window.store = require('electron-store');

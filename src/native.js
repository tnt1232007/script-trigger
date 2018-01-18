var path = require('path');
module.paths.push(path.resolve('node_modules'));

window.$ = window.jQuery = require('jquery');
window.Popper = require('popper.js');
window.Bootstrap = require('bootstrap');

window.fs = require('fs');
window.powershell = require('node-powershell');
window.fswrapper = require('chokidar');
window.jsonwrapper = require('jsonfile');
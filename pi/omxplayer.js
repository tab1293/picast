var spawn = require('child_process').spawn;
var fs = require('fs');
var buffer = require('buffer');
var os = require('os');

module.exports = function OMXPlayer() {

    this.play = function(address) {
        var proc = spawn('omxplayer', ['-b', '-o', 'hdmi', 'http://'+address+':8000/stream/out.m3u8']);
    }
    

};
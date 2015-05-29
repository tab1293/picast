var spawn = require('child_process').spawn;
var fs = require('fs');
var buffer = require('buffer');
var os = require('os');

module.exports = function OMXPlayer(address) {
    
    var src = "http://" + address + ":8000/out.m3u8";
    var proc = spawn('omxplayer', ['-b', '-o', 'hdmi', '--timeout', '20', src]);
    proc.on('close', function (code) {
            console.log('child process exited with code ' + code);
    });

    this.stop = function() {
        proc.stdin.write('q');
        proc.kill();
    };

    this.playPause = function() {
        proc.stdin.write('p');
    };
    


};

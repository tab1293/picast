var spawn = require('child_process').spawn;
var fs = require('fs');
var buffer = require('buffer');
var os = require('os');

module.exports = function OMXPlayer() {

    this.play = function(address) {
	var src = "http://" + address + ":8000/out.m3u8";
	console.log(src);
        var proc = spawn('omxplayer', ['-b', '-o', 'hdmi', '--timeout', '20', src]);
    	proc.on('close', function (code) {
            console.log('child process exited with code ' + code);
        });
    };
    

};

var spawn = require('child_process').spawn;
var fs = require('fs');
var buffer = require('buffer');
var os = require('os');

module.exports = function FFmpeg()
{
    this.platform = os.platform();
    switch(this.platform) {
        case 'linux':
            this.path = '/usr/bin/ffmpeg';
            break

        case 'darwin':
            this.path = '/usr/local/Cellar/ffmpeg/2.6.3/bin/ffmpeg';
            break;

        default: 
            this.path = "/usr/bin/ffmpeg";
    }
    this.path = typeof path !== 'undefined' ? path : __dirname + "/bin/ffmpeg"
    this.proc = null;


    this.createHLS = function(input) {
        console.log(input);
        if(this.proc) {
            this.proc.kill();
            this.proc = null;
        }

        fs.readdirSync(__dirname + "/stream").forEach(function(fileName) {
            fs.unlinkSync(__dirname + "/stream/" + fileName);
        });

        var output = __dirname + "/stream/out.m3u8";
        var args = ['-i', input, '-codec:v', 'libx264', '-crf', '22', '-threads', '0', '-codec:a', 'libfdk_aac', '-b:a', '128k', output];
        console.log(this.path + " " + JSON.stringify(args));

        var proc = spawn(this.path, args);
        this.proc = proc;
        console.log(this.proc.pid);

        proc.stdout.on('data', function(data) {
            console.log(data.toString());
        });

        proc.stderr.on('data', function(data) {
            console.log(data.toString());
        });

        proc.on('close', function (code) {
            console.log('child process exited with code ' + code);
        });
    }
}

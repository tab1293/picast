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
    this.proc = null;


    this.createHLS = function(input) {
        console.log(input);
        if(this.proc) {
            this.proc.kill();
            this.proc = null;
        }

        fs.readdirSync(__dirname + "/stream").forEach(function(fileName) {
            if(fileName != ".gitignore"){
                fs.unlinkSync(__dirname + "/stream/" + fileName);
            }
        });

        var output = __dirname + "/stream/out.m3u8";
        var args = ['-i', input, '-hls_list_size', '0', '-codec:v', 'libx264', '-crf', '22', '-threads', '0', '-codec:a', 'libfdk_aac', '-b:a', '128k', output];
        console.log(this.path + " " + JSON.stringify(args));

        this.proc = spawn(this.path, args);
        console.log(this.proc.pid);

        this.proc.stdout.on('data', function(data) {
            console.log(data.toString());
        });

        this.proc.stderr.on('data', function(data) {
            console.log(data.toString());
        });

        this.proc.on('close', function (code) {
            console.log('child process exited with code ' + code);
        });
    };

    this.stop = function() {
        if(this.proc) {
            this.proc.kill();
        }
    };
}

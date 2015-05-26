var spawn = require('child_process').spawn;
var buffer = require('buffer');

// var proc = spawn("/home/tom/csm117/picast/desktop/bin/ffmpeg", ['-i', '/home/tom/Downloads/Ex.Machina.2015.DVDRip.XviD.AC3-EVO/Ex.Machina.2015.DVDRip.XviD.AC3-EVO.avi', '/home/tom/Downloads/Ex.Machina.2015.DVDRip.XviD.AC3-EVO/Ex.Machina.2015.DVDRip.XviD.AC3-EVO.avi']);
var proc = spawn("ls", ["-lh", "/home/tom"]);
console.log("hello");
proc.stdout.on('data', function(data) {
    console.log(data.toString());
})

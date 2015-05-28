// var spawn = require('child_process').spawn;
// var buffer = require('buffer');

// // var proc = spawn("/home/tom/csm117/picast/desktop/bin/ffmpeg", ['-i', '/home/tom/Downloads/Ex.Machina.2015.DVDRip.XviD.AC3-EVO/Ex.Machina.2015.DVDRip.XviD.AC3-EVO.avi', '/home/tom/Downloads/Ex.Machina.2015.DVDRip.XviD.AC3-EVO/Ex.Machina.2015.DVDRip.XviD.AC3-EVO.avi']);
// var proc = spawn("ls", ["-lh", "/home/tom"]);
// console.log("hello");
// proc.stdout.on('data', function(data) {
//     console.log(data.toString());
// })


var dns = require('dns');
 
function reverseLookup(ip) {
    dns.reverse(ip,function(err,domains){
        if(err!=null)   callback(err);
 
        domains.forEach(function(domain){
            dns.lookup(domain,function(err, address, family){
                console.log(domain,'[',address,']');
                console.log('reverse:',ip==address);
            });
        });
    });
}
 
reverseLookup('192.168.1.139');
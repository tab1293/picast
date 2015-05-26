// loosely based on https://gist.github.com/bnerd/2011232
// requires node.js >= v0.10.0
// assumes that HLS segmenter filename base is 'out'
// and that the HLS playlist and .ts files are in the current directory
// point Safari browser to http://<hostname>:PORT/player.html

var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');


PORT = 8000;

http.createServer(function (req, res) {
    var uri = url.parse(req.url).pathname;

    if (uri == '/player.html') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write('<html><head><title>HLS Player fed by node.js' +
            '</title></head><body>');
        res.write('<video src="http://' + req.socket.localAddress +
            ':' + PORT + '/out.m" controls autoplay></body></html>');
        res.end();
        return;
    }

    var filename = __dirname + uri;
    fs.exists(filename, function (exists) {
        if (!exists) {
            console.log('file not found: ' + filename);
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('file not found: %s\n', filename);
            res.end();
        } else {
            console.log('sending file: ' + filename);
            switch (path.extname(uri)) {
            case '.m3u8':
                fs.readFile(filename, function (err, contents) {
                    if (err) {
                        res.writeHead(500);
                        res.end();
                    } else if (contents) {
                        res.writeHead(200,
                            {'Content-Type':
                            'application/vnd.apple.mpegurl'});
                            res.end(contents, 'utf-8');
                    } else {
                        console.log('emptly playlist');
                        res.writeHead(500);
                        res.end();
                    }
                });
                break;
            case '.ts':
                res.writeHead(200, { 'Content-Type':
                    'video/MP2T' });
                var stream = fs.createReadStream(filename,
                    { bufferSize: 64 * 1024 });
                stream.pipe(res);
                break;
            default:
                console.log('unknown file type: ' +
                    path.extname(uri));
                res.writeHead(500);
                res.end();
            }
        }
    });
}).listen(PORT);
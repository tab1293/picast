var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var globalShortcut = require('global-shortcut');
var fs = require('fs');
var ipc = require('ipc');
var FFmpeg = require('./ffmpeg.js')
var ffmpeg = new FFmpeg();
var Picast = require('./picast.js');
var picast = new Picast();

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

// This method will be called when Electron has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
    BrowserWindow.addDevToolsExtension(__dirname + '/react-devtools');

    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600});
    mainWindow.maximize();
    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/index.html');

    mainWindow.webContents.on('will-navigate', function(event, url) {
        var re = /file:\/\/(.*)$/
        var result = url.match(re);
        if(result) {
            event.preventDefault();
            picast.addFile(decodeURI(result[1]), function(video) {
                console.log(JSON.stringify(video));
                mainWindow.webContents.send('videos', video);
            });
        }
    });

    // Register a 'ctrl+x' shortcut listener.
    var ret = globalShortcut.register('ctrl+r', function() { mainWindow.reload(); })
    var ret = globalShortcut.register('ctrl+shift+i', function() { mainWindow.openDevTools(); })

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        picast.saveData();
        mainWindow = null;
    });
});

ipc.on('getVideos', function(event) {
  event.sender.send('videos', picast.getVideos());
});

ipc.on('stream', function(event, videoPath) {
    ffmpeg.createHLS(videoPath);
});

// HTTP server for HLS
var http = require('http');
var url = require('url');
var path = require('path');

PORT = 8000;

http.createServer(function (req, res) {
    var uri = url.parse(req.url).pathname;
    console.log(uri);
    if(uri == "/list") {
        res.writeHead(200);
        res.end(JSON.stringify(picast.getVideos()));
    }
    else if(uri == "/favicon.ico") {
        res.writeHead(200, {'Content-Type': 'image/x-icon'} );
        res.end();
        return;
    }
    else if(uri == "/stream") {
        var url_parts = url.parse(req.url, true);
        var query = url_parts.query;
        ffmpeg.createHLS(query['i']);

        console.log(JSON.stringify(query));
        res.writeHead(200);
        res.end();
    }
    else {
        var filename = __dirname + "/stream/" + uri;
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
    }
}).listen(PORT);




var dgram = require('dgram'); 
var server = dgram.createSocket("udp4"); 
server.bind(1234, function() {
    server.setBroadcast(true);
});

server.on("message", function(msg, rinfo) {
    console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
    var msg = "hello";
    server.send(msg, 0, msg.length, 1234, rinfo.address);
});
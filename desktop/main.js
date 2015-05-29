var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var globalShortcut = require('global-shortcut');
var fs = require('fs');
var ipc = require('ipc');
var Picast = require('./picast.js');
var picast = new Picast();
var dialog = require('dialog');
var chokidar = require('chokidar');
var Menu = require('menu');
var MenuItem = require('menu-item');

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
    // Menu.setApplicationMenu(menu);

    // Start up watcher
    var watcher = chokidar.watch();
    picast.watcherInit(function(paths) {
        for (i in paths) {
            watcher.add(paths[i]);
            console.log(paths[i]+" bananas")
        }
    });

    // Watcher Callbacks
    watcher.on('add', function(path) {
        console.log('File', path, 'has been added');
        picast.addFile(path, function(video) {
            console.log(JSON.stringify(video));
            mainWindow.webContents.reload();
        });
    });
    watcher.on('unlink', function(path) {
        console.log('File', path, 'has been removed');
        picast.removeFile(path, function() {
            mainWindow.webContents.reload();
        });
    });

    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600});
    mainWindow.maximize();
    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/index.html');
    mainWindow.webContents.on('did-finish-load', function() {
        mainWindow.webContents.send('videos', picast.getVideos(), picast.getSeriesManager());
    });

    mainWindow.webContents.on('will-navigate', function(event, url) {
        var re = /file:\/\/(.*)$/
        var result = url.match(re);
        if(result) {
            event.preventDefault();
            picast.addFile(decodeURI(result[1]), function(video) {
                console.log(JSON.stringify(video));
                mainWindow.webContents.send('videos', video, picast.getSeriesManager());
            });
        }
    });

    ipc.on('showMoviePage', function(event) {
        mainWindow.webContents.loadUrl('file://' + __dirname + '/pages/movieInfo.html');
        console.log(mainWindow.webContents.getUrl());
    });

    ipc.on('back', function(event) {
        console.log("trying to load homepage");
        mainWindow.webContents.goBack();
        console.log(mainWindow.webContents.getUrl());
    });

    ipc.on('getMovieInfo', function(event, moviePath) {
        // event.sender.send('movieInfo', moviePath, picast.getVideoInfo(moviePath));
        mainWindow.webContents.loadUrl('file://' + __dirname + '/pages/movieInfo.html');
        mainWindow.webContents.on('did-finish-load', function() {
            mainWindow.webContents.send('movieInfo', moviePath, picast.getVideoInfo(moviePath));
        });
    });

    ipc.on('getSeriesInfo', function(event, seriesPath) {
        mainWindow.webContents.loadUrl('file://' + __dirname + '/pages/tvSeriesInfo.html');
        mainWindow.webContents.on('did-finish-load', function() {
            mainWindow.webContents.send('tvSeriesInfo', seriesPath, picast.getSeriesInfo(seriesPath), picast.getVideos());
        });
    });

    ipc.on('getEpisodeInfo', function(event, episodePath) {
        var epInfo = picast.getVideoInfo(episodePath);
        epInfo = epInfo['Data']['Episode'][0];
        var episodeInfo = {
            'EpisodeName': epInfo['EpisodeName'][0],
            'EpisodeNumber': epInfo['EpisodeNumber'][0],
            'FirstAired': epInfo['FirstAired'][0],
            'Director': epInfo['Director'][0],
            'Writer': epInfo['Writer'][0], 
            'Overview': epInfo['Overview'][0],
            'GuestStars': epInfo['GuestStars'][0],
            'Poster': picast.getVideoInfo(episodePath)['Poster'],
            'path': episodePath
        };
        mainWindow.webContents.loadUrl('file://' + __dirname + '/pages/tvEpisodeInfo.html');
        mainWindow.webContents.on('did-finish-load', function() {
            mainWindow.webContents.send('episodeInfo', episodePath, episodeInfo);
        });
    });

    // Handles Watching Folder Dialog
    ipc.on('folderDialog', function(event) {
        var path = dialog.showOpenDialog(mainWindow, {properties: ['openDirectory', 'multiSelections' ]});
        console.log(path);
        picast.addPath(path);
        // watch folder + add all files in folder
        watcher.add(path);
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
        picast.close();
        mainWindow = null;
    });
});

ipc.on('startStream', function(event, videoPath) {
    if(picast.piConnected()) {
        picast.startStream(videoPath);
        event.sender.send('openControls');
    } else {
        event.sender.send('piNotConnected');
    }
});

ipc.on('playPauseStream', function(event) {
    if(picast.piConnected()) {
        picast.playPauseStream();
    } else {
        event.sender.send('piNotConnected');
    }
});

ipc.on('stopStream', function(event) {
    if(picast.piConnected()) {
        picast.stopStream();
    } else {
        event.sender.send('piNotConnected');
    }
});

ipc.on('getPi', function(event) {
    console.log('Main process getting pi hostname');
    event.sender.send('piHostname', picast.getPiHostname());
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
        var filename = __dirname + "/stream" + uri;
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
                case '.mp4':
                    res.writeHead(200, { 'Content-Type':
                        'video/mp4' });
                    var stream = fs.createReadStream(filename,
                        { bufferSize: 64 * 1024 });
                    stream.pipe(res);
                    break
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
var net = require('net');
var dns = require('dns');
var server = dgram.createSocket("udp4");
server.on("message", function(msg, rinfo) {
    console.log("Server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);

    var response = "I'm right here!";
    var client = net.connect(1234, rinfo.address, function() { //'connect' listener
        console.log('Connected to pi!');
        client.write('Sup pi');
    });

    client.on('close', function() {
        console.log('Pi disconnect')
        mainWindow.webContents.send('piDisconnect');
    });

    dns.reverse(rinfo.address, function(err, domains) {
        var hostname;
        if(err) {
            hostname = 'raspberrypi'
        }
        else {
            hostname = domains[0];
        }
        picast.setPi(hostname, rinfo.address, client);
        mainWindow.webContents.send('piHostname', picast.getPiHostname());
    })


});
server.bind(1234);

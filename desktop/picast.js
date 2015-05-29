var fs = require('fs');
var path = require('path');
var mime = require('mime');
var metafetch = require('./metafetch.js');
var chokidar = require('chokidar');
var FFmpeg = require('./ffmpeg.js')
var ffmpeg = new FFmpeg();

module.exports = function Picast()
{
    // Constructor code
    var _dataPath = __dirname + '/data.json';
    var _data = _loadData();
    var _piHostname;
    var _piAddress;
    var _piSocket;

    // Private members
    function _loadData() {
        if(!fs.existsSync(_dataPath)) {
            fs.writeFileSync(_dataPath, '{}');
            return {'videos': {}};
        }
        else {
            return JSON.parse(fs.readFileSync(_dataPath));
        }
    }

    // Public member functions
    this.getVideos = function() {
        return _data['videos'];
    };

    // Function to clean season/episode number for thetvdb API call
    this.cleanNumber = function(number) {
        if(number.charAt(0) == '0') {
            return number.charAt(1);
        }
        return number;
    };

    this.addFile = function(filePath, cb) {
        console.log(filePath);
        var type = mime.lookup(filePath);
        if(type.search('video') != -1) {
            console.log(JSON.stringify(_data));
            if(_data['videos'][filePath] === undefined) {
                var filename = path.basename(filePath);
                var movieRegex = /((\w+[\. ])+)([0-9]{4})/;
                var anotherMovieRegex = /([\w+ ]+)(\([0-9]{4}\))/;

                var tvSeriesRegex = /.+?(?=S\d\dE\d\d)/;
                var tvSeasonEpisodeRegex = /S\d\dE\d\d/;

                if(filename.match(movieRegex) || filename.match(anotherMovieRegex)) {
                    var match, title, year = "";
                    if (filename.match(movieRegex)) {
                        match = filename.match(movieRegex);
                        title = match[1].replace(/\./g, ' ').trim();
                        year = match[match.length-1]
                    } else if (filename.match(anotherMovieRegex)) {
                        match = filename.match(anotherMovieRegex);
                        title = match[1].trim();
                        year = match[2].substring(1, 5);
                    }
                    metafetch.fetchMovie(title, year, function(movieData) {
                        movieData['mime'] = type;
                        if(!movieData['error']) {
                            movieData['type'] = 'movie';
                            _data['videos'][filePath] = movieData;
                            console.log(filePath);
                            var data = {}
                            data[filePath] = movieData;
                            cb(data);
                        }
                        else {
                            movieData['title'] = filePath;
                            _data['videos'][filePath] = movieData
                            var data = {}
                            data[filePath] = movieData;
                            cb(data);
                        }
                    });
                } else if(filename.match(tvSeriesRegex)) {
                    var title = filename.match(tvSeriesRegex)[0];
                    var seasonEpisode = filename.match(tvSeasonEpisodeRegex);
                    var season = this.cleanNumber(seasonEpisode[0].substring(1, 3));
                    var episode = this.cleanNumber(seasonEpisode[0].substring(4, 6));

                    console.log(title);
                    console.log(season);
                    console.log(episode);

                    metafetch.fetchTV(title, season, episode, function(tvData) {
                        tvData['mime'] = type;
                        if(!tvData['error']) {
                            tvData['type'] = 'tv';
                            _data['videos'][filePath] = tvData;
                            console.log(filePath);
                            var data = {};
                            data[filePath] = tvData;
                            cb(data);
                        }
                        else {
                            tvData['title'] = filePath;
                            _data['videos'][filePath] = tvData;
                            var data = {}
                            data[filepath] = movieData;
                            cb(data);
                        }
                    });
                }
                else {
                    var movieData = {'title': filePath}
                    _data['videos'][filePath] = movieData;
                    var data = {}
                    data[filePath] = movieData;
                    cb(data);
                }
            }
            else {
                console.log("Already added that video");
            }
        }

    };

    this.saveData = function() {
        fs.writeFileSync(_dataPath, JSON.stringify(_data));

    };

    this.startStream = function(path) {
        ffmpeg.createHLS(path);
        setTimeout(function() {
            _piSocket.write('start');
        }, 2000);
    };

    this.playPauseStream = function() {
        _piSocket.write('playPause');
    };

    this.stopStream = function() {
        _piSocket.write('stop');
    };

    this.getVideoInfo = function(path) {
        var videos = _data['videos'];
        return videos[path];
    }

    this.setPi = function(hostname, address, socket) {
        _piHostname = hostname;
        _piAddress = address;
        _piSocket = socket;
    };

    this.getPiHostname = function() {
        return _piHostname;
    }
}

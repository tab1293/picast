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
    var _piHostname = null;
    var _piAddress = null;
    var _piSocket = null;

    // Private members
    function _loadData() {
        if(!fs.existsSync(_dataPath)) {
            fs.writeFileSync(_dataPath, '{}');
            return {'videos': {}, 'paths': {}, 'seriesManager': {}};
        }
        else {
            return JSON.parse(fs.readFileSync(_dataPath));
        }
    }

    // Public member functions
    this.getData = function() {
        return _data;
    };

    this.getVideos = function() {
        return _data['videos'];
    };

    this.getSeriesManager = function() {
        return _data['seriesManager'];
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
                            movieData['type'] = 'movie';
                            _data['videos'][filePath] = movieData
                            var data = {}
                            data[filePath] = movieData;
                            cb(data);
                        }
                    });
                } else if(filename.match(tvSeriesRegex)) {
                    var match = filename.match(tvSeriesRegex);
                    var matchStr = match[0];
                    matchStr = matchStr.replace(/\./g, ' ');
                    var title = matchStr;
                    var seasonEpisode = filename.match(tvSeasonEpisodeRegex);
                    var season = this.cleanNumber(seasonEpisode[0].substring(1, 3));
                    var episode = this.cleanNumber(seasonEpisode[0].substring(4, 6));

                    console.log(title);
                    console.log(season);
                    console.log(episode);

                    metafetch.fetchTV(title, season, episode, function(seriesData, episodeData) {
                        episodeData['mime'] = type;
                        if(!episodeData['error']) {
                            episodeData['type'] = 'tv';
                            _data['videos'][filePath] = episodeData;
                            var seriesName = seriesData['seriesName'];
                            if(_data['seriesManager'][seriesName] == undefined) {
                                _data['seriesManager'][seriesName] = seriesData;
                                _data['seriesManager'][seriesName]['episodeList'] = [];
                            }
                            _data['seriesManager'][seriesName]['episodeList'].push(filePath);
                            console.log(filePath);
                            var data = {};
                            data[filePath] = episodeData;
                            cb(data);
                        }
                        else {
                            episodeData['title'] = filePath;
                            episodeData['type'] = 'tv';
                            _data['videos'][filePath] = episodeData;
                            var data = {}
                            data[filepath] = movieData;
                            cb(data);
                        }
                    });
                }
                else {
                    var movieData = {'title': filePath}
                    movieData['type'] = 'other';
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

    this.removeFile = function(filePath, cb) {
        delete _data['videos'][filePath];
        cb();
    }

    this.addPath = function(filePath) {
        _data['paths'][filePath] = "";
    }

    this.watcherInit = function(cb) {
        var paths = [];
        for (p in _data['paths']) {
            paths.push(p);
        }
        console.log(paths+" pineapples");
        cb(paths);
    }

    this.saveData = function() {
        fs.writeFileSync(_dataPath, JSON.stringify(_data));
    };

    this.startStream = function(path) {
        if(_piSocket) {
            ffmpeg.createHLS(path);
            setTimeout(function() {
                _piSocket.write('start');
            }, 5000);
        }
    };

    this.playPauseStream = function() {
        if(_piSocket) {
            _piSocket.write('playPause');
        }
    };

    this.stopStream = function() {
        if(_piSocket) {
            _piSocket.write('stop');
            ffmpeg.stop();
        }
    };

    this.getVideoInfo = function(path) {
        var videos = _data['videos'];
        return videos[path];
    }

    this.getSeriesInfo = function(path) {
        var series = _data['seriesManager'];
        return series[path];
    }

    this.setPi = function(hostname, address, socket) {
        _piHostname = hostname;
        _piAddress = address;
        _piSocket = socket;
    };

    this.getPiHostname = function() {
        return _piHostname;
    }

    this.piConnected = function() {
        if(_piSocket) {
            return true;
        }
        else {
            return false;
        }
    }

    this.close = function() {
        ffmpeg.stop();
    }
}

var fs = require('fs');
var path = require('path');
var mime = require('mime');
var metafetch = require('./metafetch.js')
var chokidar = require('chokidar');

module.exports = function Picast()
{
    // Constructor code
    var _dataPath = __dirname + '/data.json';    
    var _data = _loadData();
    
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

    this.addFile = function(filePath, cb) {
        console.log(filePath);
        var type = mime.lookup(filePath);
        if(type.search('video') != -1) {
            console.log(JSON.stringify(_data));
            if(_data['videos'][filePath] === undefined) {
                var filename = path.basename(filePath);
                var movieRegex = /((\w+[\. ])+)([0-9]{4})/;
                
                if(filename.match(movieRegex)) {
                    var match = filename.match(movieRegex);
                    var title = match[1].replace(/\./g, ' ').trim();
                    var year = match[match.length-1]
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
}
var request = require('request');
var parser = require('xml2js').parseString;

module.exports =
{
    fetchMovie: function(title, year, cb) {
        var url = "http://www.omdbapi.com/?t=" + encodeURIComponent(title) + "&y=" + encodeURIComponent(year) + "&plot=short&r=json";
        console.log(url);
        request(url, function(error, response, body) {
            if (response.statusCode == 200) {
                console.log(body); // Show the HTML for the Google homepage.
                var movieInfo = JSON.parse(body);
                // Retry without the year
                if(!movieInfo['Response']) {
                    var retryUrl = "http://www.omdbapi.com/?t=" + encodeURIComponent(title) + "&plot=short&r=json";
                    request(url, function(error, response, body) {
                        if(response.statusCode == 200){
                            if(!movieInfo['response']) {
                                cb({'error': true, 'msg': 'Moive not found with OMDB API' });
                            }
                            else {
                                movieInfo['error'] = false;
                                cb(movieInfo);
                            }
                        }
                        else {
                            cb({'error': true, 'msg': 'Saw a non 200 error response code'});
                        }
                    });
                }
                else {
                    cb(movieInfo);
                }
            }
            else {
                cb ({'error': true, 'msg': 'Saw a non 200 error response code'});
            }
        });
    },

    fetchTV: function(title, season, episode, cb) {
        // D485CC105455D10A thetvdb API key
        var posterURLbase = "http://thetvdb.com/banners/";

        var seriesUrl = "http://thetvdb.com/api/GetSeries.php?seriesname=" + encodeURIComponent(title);
        console.log(seriesUrl);

        // Get series ID from db
        request(seriesUrl, function(error, response, body) {
            var seriesId = "";
            if (response.statusCode == 200) {
                console.log(body);
                var seriesData = {};
                parser(body, function(err, result) {
                    seriesId = result["Data"]["Series"][0]["seriesid"][0];
                    seriesData["seriesId"] = seriesId;
                    seriesData["seriesName"] = result["Data"]["Series"][0]["SeriesName"][0];
                    seriesData["overview"] = result["Data"]["Series"][0]["Overview"][0];
                    seriesData["banner"] = posterURLbase + result["Data"]["Series"][0]["banner"][0];
                    seriesData["path"] = seriesData["seriesName"];
                });

                // With series ID, season, and episode, get metadata for episode
                var url = "http://thetvdb.com/api/D485CC105455D10A/series/" +
                    encodeURIComponent(seriesId) + "/default/" + encodeURIComponent(season) + "/" + encodeURIComponent(episode) + "/en.xml";
                request(url, function(error, response, body) {
                    if (response.statusCode == 200) {
                        console.log(body);
                        parser(body, function(err, result) {
                            result["Poster"] = posterURLbase + result["Data"]["Episode"][0]["filename"];
                            cb(seriesData, result);
                        });
                    } else {
                        cb({'error': true, 'msg': 'A non 200 error response code occurred'});
                    }
                });
            } else {
                cb({'error': true, 'msg': 'A non 200 error response code occurred'});
            }
        });
    },
}

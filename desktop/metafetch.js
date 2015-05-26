var request = require('request');

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
}
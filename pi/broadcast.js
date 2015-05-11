var dgram = require('dgram');
var message = new Buffer("Some bytes");
var client = dgram.createSocket("udp4");


client.bind(function() {
    client.setBroadcast(true);
    client.send(message, 0, message.length, 12345, "131.179.17.255", function(err) {
        client.close();
    });
});



var server = dgram.createSocket("udp4");

server.on("message", function(msg, rinfo) {
    console.log("server got: " + msg + " from " + rinfo.address + ":" + rinfo.port);
});

// server.bind(12346);

var net = require('net');
var dgram = require('dgram');
var omxplayer = require('./omxplayer.js');
var broadcastMsg = new Buffer("Where are you?");
var broadcaster = dgram.createSocket("udp4");
var desktopAddress = null;

broadcaster.bind('4321');
broadcaster.on('message', function() {
    broadcaster.setBroadcast(true);
    broadcaster.send(broadcastMsg, 0, broadcastMsg.length, 1234, "255.255.255.255");
    console.log("Sending broadcast");
});

var relay = dgram.createSocket("udp4");
var relayMsg = new Buffer("Send broadcast");
var sendBroadcast = function() {
    relay.send(relayMsg, 0, relayMsg.length, 4321, "127.0.0.1");
    console.log("Sending relay");
};

var timeout = setInterval(sendBroadcast, 1000);

var server = net.createServer(function(socket) {
    var address = socket.address();
    console.log("Client connected at " + address['address'] + " Port: " + address['port']);
    desktopAddress = address;
    clearInterval(timeout);
    console.log("Interval cleared");

    socket.on('data', function(data) {
        var str = data.toString();
        switch(str) {
            case 'play':
                console.log('Playing');
                omxplayer.play(desktopAddress);
                break;
            case 'pause':
                console.log('pause');

        }
        console.log(data.toString());
    })

    socket.on('close', function() {
        console.log("Connection ended. Should send broadcasts again");
        timeout = setInterval(sendBroadcast, 1000);
    });

});

server.listen('1234', function() {
    console.log("Server is listening");
});


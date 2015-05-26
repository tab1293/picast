var net = require('net');
var dgram = require('dgram');
var broadcastMsg = new Buffer("Where are you?");
var client = dgram.createSocket("udp4");
var desktopAddress = null;

var sendBroadcast = function() {
    client.setBroadcast(true);
    client.send(message, 0, message.length, 41234, "255.255.255.255");
};

var timeout = setInterval(sendBroadcast, 1000);

var server = net.createServer(function(socket) {
    var address = socket.address();
    console.log("Client connected at " + address['address'] + " Port: " + address['port']);
    desktopAddress = address;
    clearInterval(timeout);
});

server.listen('1234', function() {
    console.log("Server is listening");
});




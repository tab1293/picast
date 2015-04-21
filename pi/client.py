import errno
import functools
import tornado.ioloop
import tornado.web
import socket
import pexpect

# from pyomxplayer import OMXPlayer

def connection_ready(sock, fd, events):
    while True:
        try:
            data, address = sock.recvfrom(1024)
        except socket.error as e:
            if e.args[0] not in (errno.EWOULDBLOCK, errno.EAGAIN):
                raise
            return

        print data

class PiHandler(tornado.web.RequestHandler):
    def get(self, command):
        player = self.settings['player']
        if command == 'togglePause':
            if player.process is None:
                player.create()
            else:
                player.toggle_pause()

        elif command == 'stop':
            player.stop()

        else:
            self.write("Invalid command")


class Player():
    def __init__(self):
        self.process = None

    def create(self):
        self.process = pexpect.spawn("/usr/bin/omxplayer -o hdmi http://192.168.1.100:8080")

    def toggle_pause(self):
        self.process.send('p')
        
    def stop(self):
        self.process.send('q')


if __name__ == '__main__':
    UDP_IP = ""
    UDP_PORT = 5005 
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((UDP_IP, UDP_PORT))
    callback = functools.partial(connection_ready, sock)

    io_loop = tornado.ioloop.IOLoop.current()
    player = Player()

    application = tornado.web.Application([
        (r"/(togglePause|test)", PiHandler),
    ], ioloop=io_loop, player=player, omx_pid=-1, omx_alive=False, debug=True)
    application.listen(8085)

    io_loop.add_handler(sock.fileno(), callback, io_loop.READ)
    io_loop.start()
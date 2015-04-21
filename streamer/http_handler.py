import tornado.web

class HttpHandler(tornado.web.RequestHandler):
    def get(self, command):
        # TODO add some kind of auth
        name = self.get_argument('name')
        streamer = self.settings['streamer']

        # Command handler
        if command == "set":
            i = self.get_argument('i', default=None)
            if i is None:
                # TODO add error formatting
                self.write("Media is not set")
            else:
                # Need to think about how to set up duplicate streams
                transcode = self.get_argument('transcode', default=None)
                output = self.get_argument('output', default=None)
                streamer.set(name, i, transcode, output)

                self.write("Added broadcast " + name + "\n" + i +"\n" + transcode + "\n" + output)
        
        elif command == "play":
            streamer.play()
            self.write("Playing " + name)

        elif command == "pause":
            streamer.pause()
            self.write("Paused " + name)
        elif command == "stop":
            streamer.stop()
            self.write("Stopped " + name)
        elif command == "test":
            self.write("Test command")
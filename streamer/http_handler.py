import tornado.web

class HttpHandler(tornado.web.RequestHandler):
    def get(self, command):
        # TODO add some kind of auth
        streamer = self.settings['streamer']
        gui = self.settings['gui']

        # Command handler
        if command == "set":
            i = self.get_argument('i', default=None)
            name = self.get_argument('name', default="stream")
            if i is None:
                # TODO add error formatting
                self.write("Media is not set")
            else:
                streamer.set(name, i)
                self.write("Added broadcast " + name + "\n" + i +"\n")
        
        elif command == "play":
            streamer.play()
            self.write("Playing")

        elif command == "pause":
            streamer.pause()
            self.write("Paused")
        elif command == "stop":
            streamer.stop()
            self.write("Stopped")
        elif command == "list":
            self.write({'file_paths': gui.listVideoFiles()})
        elif command == "test":
            self.write("Test command")
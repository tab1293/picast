import tornado.web

class VlcHandler(tornado.web.RequestHandler):
    def get(self, command):
        # TODO add some kind of auth
        name = self.get_argument('name')
        instance = self.settings['vlc_instance']

        # Command handler
        if command == "set":
            i = self.get_argument('i', default=None)
            if i is None:
                # TODO add error formatting
                self.write("Media is not set")
            else:
                # Need to think about how to set up duplicate streams
                transcode = self.get_argument('transcode', default=None)
                if transcode is None:
                    transcode = '#transcode{venc=x264, vcodec=h264, scale=Auto, acodec=mp4a, channels=2, threads=2}'

                output = self.get_argument('output', default=None)
                if output is None:
                    output = ':standard{access=http, mux=ts,dst=:8080}'

                instance.vlm_add_broadcast(name, i, transcode + output, 0, None, True, False)
                self.write("Added broadcast " + name + "\n" + i +"\n" + transcode + "\n" + output)
        
        elif command == "play":
            instance.vlm_play_media(name)
            self.write("Playing " + name)

        elif command == "pause":
            instance.vlm_pause_media(name)
            self.write("Paused " + name)

        elif command == "stop":
            instance.vlm_stop_media(name)
            self.write("Stopped " + name)
        elif command == "test":
            self.write("Test command")

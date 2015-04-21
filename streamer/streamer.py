import vlc

class Streamer():

    def __init__(self):
        self.instance = vlc.Instance()
        self.event_manager = self.instance.vlm_get_event_manager()
        self.event_manager.event_attach(vlc.EventType.VlmMediaInstanceStatusEnd , self.doneCb) 

        self.broadcast = None
        self.state = None

    def doneCb(self, event):
        print "Seen the done event " + str(event)

    def set(self, name, i, transcode=None, output=None):
        if self.broadcast is not None:
            self.stop()

        if transcode is None:
            transcode = '#transcode{venc=x264, vcodec=h264, scale=Auto, acodec=mp4a, channels=2, threads=2}'

        if output is None:
            # Output to http stream on port 8080
            output = ':standard{access=http, mux=ts,dst=:8080}'

            # Output to http stream and file
            # output = ':duplicate{dst={standard{access=file, mux=ts, dst=/home/tom/csm117/project/streamer/output.mp4}}, dst=standard{access=http, mux=ts,dst=:8080}}'

        print "Adding broadcast"
        self.instance.vlm_add_broadcast(name, i, transcode + output, 0, None, True, False)
        self.broadcast = name
        self.state = 'set'

    def play(self):
        if self.broadcast is not None:
            self.instance.vlm_play_media(self.broadcast)
            self.state = 'playing'

    def pause(self):
        if self.broadcast is not None:
            self.instance.vlm_pause_media(self.broadcast)
            self.state = 'paused'

    def stop(self):
        if self.broadcast is not None:
            self.instance.vlm_stop_media(self.broadcast)
            self.instance.vlm_del_media(self.broadcast)
            self.broadcast = None
            self.state = 'stopped'


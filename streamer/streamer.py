import vlc

from modules import StandardModule
from chains import Chain

class Streamer():

    def __init__(self):
        self.instance = vlc.Instance()
        self.event_manager = self.instance.vlm_get_event_manager()
        self.event_manager.event_attach(vlc.EventType.VlmMediaInstanceStatusEnd , self.doneCb) 

        self.broadcast = None
        self.state = None

    def doneCb(self, event):
        print("Seen the done event " + str(event))

    def set(self, name, input, chain=None):
        if self.broadcast is not None:
            self.stop()

        if chain is None:
            sm = StandardModule()
            sm.setAccess('http')
            sm.setMux('ts')
            sm.setDst(':8080')
            chain = Chain()
            chain.addModule(sm)

        print(str(chain))
        self.instance.vlm_add_broadcast(name, input, str(chain), 0, None, True, False)
        self.broadcast = name
        self.state = 'set'



    # def set(self, name, i, transcode=None, output=None):
    #     if self.broadcast is not None:
    #         self.stop()


    #         self.instance.vlm_add_broadcast(name, i, transcode + output, 0, None, True, False)
    #         self.broadcast = name
    #         self.state = 'set'



    #     if transcode is None:
    #         transcode = '#transcode{venc=x264, vcodec=h264, scale=Auto, acodec=mp4a, channels=2, threads=2}'
    #     if output is None:
    #         # Output to http stream on port 8080
    #         output = ':standard{access=http, mux=ts,dst=:8080}'

    #         # Output to http stream and file
    #         # output = ':duplicate{dst={standard{access=file, mux=ts, dst=/home/tom/csm117/project/streamer/output.mp4}}, dst=standard{access=http, mux=ts,dst=:8080}}'
    #         http://mydomain.com/streaming/mystream-########.ts},mux=ts{use-key-frames},dst=/var/www/streaming/mystream-########.ts}'
    #         # Live HTTP Output
    #         # #transcode{width=320,height=240,fps=25,vcodec=h264,vb=256,venc=x264{aud,profile=baseline,level=30,keyint=30,ref=1},acodec=mp3,ab=96}:std{access=livehttp{seglen=10,delsegs=false,numsegs=0,index=/var/www/streaming/mystream.m3u8,index-url=http://mydomain.com/streaming/mystream-########.ts},mux=ts{use-key-frames},dst=/var/www/streaming/mystream-########.ts}
    #         output=':standard{access=livehttp{delsegs=false, index=/home/tom/picast/streamer/live/mystream.m3u8, index-url=http://localhost/streaming/mystream-########.ts}, }'

    #     print("Adding broadcast")
    #     self.instance.vlm_add_broadcast(name, i, transcode + output, 0, None, True, False)
    #     self.broadcast = name
    #     self.state = 'set'

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


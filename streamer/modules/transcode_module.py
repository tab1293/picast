from .vlc_module import VlcModule

class TranscodeModule(VlcModule):

    def __init__(self):
        super().__init__('standard')

        self._vcodec_params = ['h264']

        self._venc_params = ['ffmpeg', 'theora', 'x264']

        se;f.

    def setVcodec(self, vcodec):
        self.setOption('vcodec', vcodec, self._vcodec_params)

    def setVb(self, vb):
        if type(vb) == int:
            self.setOption('vb', vb)
        else:
            raise ValueError("Video bit rate needs to be an integer")



        self._access_params = ['file', 'udp', 'http', 'https', 'mmsh', 'livehttp']
        self._access_param_opts = {
            'udp': {'caching': int, 'ttl': int, 'group': int, 'late': int},
            'http': {'user': str, 'pwd': str, 'mime': str},
            'https': {'cert': str, 'key': str, 'ca': str, 'crl': str},
            'livehttp': {'splitanywhere': bool, 'seglen': int, 'numsegs': int, 'delsegs': bool, 'index': str, 'index-url': str, 'ratecontrol': bool},
        }

        self._mux_params = ['ts', 'ps', 'mpeg1', 'ogg', 'asf', 'asfh', 'avi', 'mpjpeg']
        self._mux_param_opts = {
            'ts': {'pid-video': int, 'pid-audio': int, 'pid-spi': int, 'pid-pmt': int, 'tsid': int, 'shaping': int, 'use-key-frames': bool, 'pcr': int, 'dts-delay': int, 'crpyt-audio': bool, 'csa-ck': str},
            'ps': {'dts-delay': int},
            'mpeg1': {'dts-delay': int},
            'asf': {'title': str, 'author': str, 'copyright': str, 'comment': str, 'rating': str},
            'asfh': {'title': str, 'author': str, 'copyright': str, 'comment': str, 'rating': str}
        }

    def setAccess(self, access, access_options=[]):
        self.setOption('access', access, self._access_params, access_options, self._access_param_opts)

    def getAccess(self):
        return self.getOption('access')

    def setMux(self, mux, mux_options=[]):
        self.setOption('mux', mux, self._mux_params, mux_options, self._mux_param_opts)

    def getMux(self):
        return self.getOption('mux')
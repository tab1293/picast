from .vlc_module import VlcModule

class StandardModule(VlcModule):

    _access_params = ['file', 'udp', 'http', 'https', 'mmsh', 'livehttp']
    _access_param_opts = {
        'udp': [('caching', int), ('ttl', int), ('group', int), ('late', int)],
        'http': [('user', str), ('pwd', str), ('mime', str)],
        'https': [('cert', str), ('key', str), ('ca', str), ('crl', str)],
        'livehttp': [('splitanywhere', bool), ('seglen', int), ('numsegs', int), ('delsegs', bool), ('index', str), ('index-url', str), ('ratecontrol', bool)]
    }

    _mux_params = ['ts', 'ps', 'mpeg1', 'ogg', 'asf', 'asfh', 'avi', 'mpjpeg']
    _mux_param_opts = {
        'ts': [('pid-video', int), ('pid-audio', int), ('pid-spi', int), ('pid-pmt', int), ('tsid', int), ('shaping', int), ('use-key-frames', bool), ('pcr', int), ('dts-delay', int), ('crpyt-audio', bool), ('csa-ck', str)],
        'ps': [('dts-delay', int)],
        'mpeg1': [('dts-delay', int)],
        'asf': [('title', str), ('author', str), ('copyright', str), ('comment', str), ('rating', str)],
        'asfh': [('title', str), ('author', str), ('copyright', str), ('comment', str), ('rating', str)]
    }

    def __init__(self):
        super().__init__('standard')

    def setAccess(self, access, access_options=[]):
        self.setOption('access', access, self._access_params, access_options, self._access_param_opts)

    def getAccess(self):
        return self.getOption('access')

    def setMux(self, mux, mux_options=[]):
        self.setOption('mux', mux, self._mux_params, mux_options, self._mux_param_opts)

    def getMux(self):
        return self.getOption('mux')

    def setDst(self, dst):
        if self.getAccess()[0] is not None:
            if self.getAccess()[0] == "file":
                # Todo write a file regex
                self.setOption('dst', dst)
            elif self.getAccess()[0] == "udp" or self.getAccess()[0] == "rtp":
                # Todo write a udp/rtp address regex
                self.setOption('dst', dst)
            elif self.getAccess()[0] == "http":
                self.setOption('dst', dst)
            else:
                raise ValueError("Saw an invalid access type when setting the destination")
        else:
            raise ValueError("You must set an access type before you set a destination")

    def getDst(self):
        return self.getOption('mux')

    def setSap(self, ipv6=False):
        if self.getAccess()[0] == 'udp':
            if ipv6:
                self.setOption('sap-ipv6')
            else:
                self.setOption('sap')
        else:
            raise ValueError("Access must be UDP if you want to set SAP")

    def getSap(self):
        if self.getOption('sap') is None:
            return False
        else:
            return True

    def setGroup(self, group):
        if self.getSap():
            if type(group) == str:
                self.setOption('group', group)
            else:
                raise ValueError("Group name must be string")
        else:
            raise ValueError("SAP must set if you want to set the group name")

    def getGroup(self):
        return self.getOption('group')

    def setSlp(self):
        if self.getAccess()[0] == 'udp':
            self.setOption('slp')
        else:
            raise ValueError("Access must be UDP if you want to set SLP")

    def getSlp(self):
        if self.getOption('sap') is None:
            return False
        else:
            return True

    def setName(self, name):
        if self.getSap() or self.getSlp():
            if type(name) == str:
                self.setOption('name', name)
            else:
                raise ValueError("Name of stream must be a string")
        else:
            raise ValueError("The SAP or SLP option must be set in order to set the name")



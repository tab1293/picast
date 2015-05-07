from .vlc_module import VlcModule

class DisplayModule(VlcModule):

	_display_params = ['delay']

	def __init__(self):
		VlcModule.__init__(self, 'display')

	def setNoaudio(self):
		self.setOption('noaudio')

	def setNovideo(self):
		self.setOption('novideo')

	#TODO: check that this parameter is valid
	def setDelay(self, delay):
		self.setOption('delay', delay)

	def getDelay(self):
		self.getOption('delay')
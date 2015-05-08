from .vlc_module import VlcModule

class DisplayModule(VlcModule):

	_display_params = ['delay']

	def __init__(self):
		super().__init__('display')

	def setNoaudio(self):
		self.setOption('noaudio')

	def setNovideo(self):
		self.setOption('novideo')

	def setDelay(self, delay):
		if type(delay)== int:
			self.setOption('delay', delay)
		else:
			raise ValueError("Delay must be an integer")

	def getDelay(self):
		self.getOption('delay')
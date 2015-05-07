from .vlc_module import VlcModule

# TODO: Not sure if this needs anything else.
# 			Only based off of standard_module.py.
class Display(VlcModule):

	_display_params = ['delay']

	def __init__(self):
		super().__init__('display')

	def setNoaudio(self):
		self.setOption('noaudio')

	def setNovideo(self):
		self.setOption('novideo')

	def setDelay(self, delay):
		self.setOption('delay', delay, self._display_params)

	def getDelay(self):
		self.getOption('delay')
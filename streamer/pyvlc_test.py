from modules import StandardModule
from modules import DisplayModule
from chains import Chain

sm = StandardModule()
d = DisplayModule()
sm.setAccess('http')
sm.setMux('ts')
sm.setDst(':8080')
d.setNoaudio()
d.setDelay('30')
# live_http_params = {'splitanywhere': False, 'seglen': 10, 'numsegs': 0, 'delsegs': False, 'index': '/home/tom/picast/streamer/stream.m3u8', 'index-url': 'http://localhost/stream-########.mp4', 'ratecontrol': False}
chain = Chain()
chain.addModule(sm)
chain.addModule(d)

print(str(chain))
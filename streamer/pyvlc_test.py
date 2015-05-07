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
chain = Chain()
chain.addModule(sm)
chain.addModule(d)

print(str(chain))
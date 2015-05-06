from modules import StandardModule
from chains import Chain

sm = StandardModule()
sm.setAccess('http')
sm.setMux('ts')
sm.setDst(':8080')
chain = Chain()
chain.addModule(sm)

print(str(chain))
import sys
from PyQt4 import QtCore, QtGui
import tornado.httpclient
from tornado.httputil import url_concat

from streamer import Streamer
from http_handler import HttpHandler

import tornado.ioloop
import tornado.web
from threading import Thread

class StreamerWindow(QtGui.QWidget):
    
    def __init__(self, streamer):
        super(StreamerWindow, self).__init__()

        self.streamer = streamer

        # self.process = QtCore.QProcess(self)
        # self.process.start('python',['http_server.py'])

        self.videoFiles = self.loadVideoFiles()
        self.http_client = tornado.httpclient.HTTPClient()

        self.initUI()

    def loadVideoFiles(self):
        return QtCore.QDir("/home/tom/Videos").entryInfoList()
        
        
    def initUI(self):
        # Create buttons
        playIcon = QtGui.QIcon.fromTheme('media-playback-start')
        pauseIcon = QtGui.QIcon.fromTheme('media-playback-pause')
        stopIcon = QtGui.QIcon.fromTheme('media-playback-stop')
        self.playPauseButton = QtGui.QPushButton(playIcon, "Stream")

        # Connect buttons
        self.connect(self.playPauseButton, QtCore.SIGNAL("released()"), self.streamClick)

        # Create button layout
        self.buttonLayout = QtGui.QHBoxLayout()
        self.buttonLayout.addWidget(self.playPauseButton)

        # Create filelist
        self.fileList = QtGui.QListWidget()
        for f in self.videoFiles:
            item = QtGui.QListWidgetItem(f.fileName())
            item.setData(QtCore.Qt.UserRole, f.filePath())
            self.fileList.addItem(item)

        # Create main layout
        self.layout = QtGui.QVBoxLayout()
        self.layout.addWidget(self.fileList)
        self.layout.addLayout(self.buttonLayout)

        # Set the main layout
        self.setLayout(self.layout)

        # Create window, center it, a'set' or snd show it
        self.setGeometry(0, 0, 800, 500)
        self.center()
        self.show()

    def center(self):
        qr = self.frameGeometry()
        cp = QtGui.QDesktopWidget().availableGeometry().center()
        qr.moveCenter(cp)
        self.move(qr.topLeft())

    def streamClick(self):
        listItem = self.fileList.currentItem()
        fileName = listItem.text()
        filePath = listItem.data(QtCore.Qt.UserRole).toString()

        if self.streamer.broadcast != fileName:
            self.streamer.set(str(fileName), str(filePath))
            self.streamer.play()
            
        # self.http_client.fetch('http://192.168.1.139:8085/togglePause')

    def closeEvent(self, event):
         tornado.ioloop.IOLoop.instance().stop()

def main():
    app = QtGui.QApplication(sys.argv)
    streamer = Streamer()
    application = tornado.web.Application([
        (r"/(set|play|pause|stop|test)", HttpHandler),
    ], debug=True, streamer=streamer)
    application.listen(8888)
    t = Thread(target=lambda: tornado.ioloop.IOLoop.instance().start())
    t.start()

    w = StreamerWindow(streamer)
    sys.exit(app.exec_())


if __name__ == '__main__':
    main()    

# if __name__ == "__main__":
#     ioloop = tornado.ioloop.IOLoop.instance()
#     application = tornado.web.Application([
#         (r"/vlc/(set|play|pause|stop|test)", VlcHandler),
#     ], ioloop=ioloop, vlc_instance=vlc.Instance(), debug=True)
#     application.listen(8085)
#     ioloop.start()


# app = QtGui.QApplication([])
# icon = QtGui.QSystemTrayIcon(QtGui.QIcon("test.png"), app)
# menu = QtGui.QMenu()
# menu.addAction("Quit", QtGui.qApp.quit)
# icon.setContextMenu(menu)
# icon.show()
# app.exec_()
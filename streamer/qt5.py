import sys
import os
from threading import Thread
import json


from PyQt5 import QtCore, QtWidgets, QtGui
from PyQt5.QtWidgets import QApplication, QWidget, QDesktopWidget

from streamer import Streamer

import tornado.ioloop
import tornado.web
from http_handler import HttpHandler

import os.path
from appdirs import *


class StreamerWindow(QWidget):
    
    def __init__(self, streamer):
        super().__init__()

        self.streamer = streamer
        self.app_data = self.loadAppData()
        self.video_files = self.loadVideoFiles()
        self.initUI()

        
    def initUI(self):

        self.fileList = QtWidgets.QListWidget()

        self.layout = QtWidgets.QVBoxLayout()
        self.layout.addWidget(self.fileList)
        for f in self.video_files:
            item = QtWidgets.QListWidgetItem(f.fileName())
            item.setData(QtCore.Qt.UserRole, f.filePath())
            self.fileList.addItem(item)


        self.setLayout(self.layout)
        self.setGeometry(300, 300, 300, 220)
        self.setWindowTitle('PiCast')
        self.center()
        self.show()

    def center(self):
        qr = self.frameGeometry()
        cp = QDesktopWidget().availableGeometry().center()
        qr.moveCenter(cp)
        self.move(qr.topLeft())

    def loadAppData(self):
        self.app_data_folder = user_data_dir("PiCast", "TAB")
        self.app_data_path = self.app_data_folder + "/data.json"

        print(self.app_data_path)

        if os.path.isfile(self.app_data_path):
            with open(self.app_data_path) as data_file:
                return json.load(data_file)
        else:
            if not os.path.exists(self.app_data_folder):
                os.makedirs(self.app_data_folder)

            with open(self.app_data_path, 'w') as data_file:
                initial_data = {
                    'video_folders': []
                }
                json.dump(initial_data, data_file)

            return initial_data

    def loadVideoFiles(self):
        files = []
        for folder in self.app_data['video_folders']:
            for f in QtCore.QDir(folder).entryInfoList():
                files.append(f)

        return files
        

    def closeEvent(self, event):
        tornado.ioloop.IOLoop.instance().stop()
        
if __name__ == '__main__':
    
    app = QApplication(sys.argv)
    streamer = Streamer()

    web_app = tornado.web.Application([
        (r"/(set|play|pause|stop|test)", HttpHandler),
    ], debug=True, streamer=streamer)
    web_app.listen(8888)
    t = Thread(target=lambda: tornado.ioloop.IOLoop.instance().start())
    t.start()

    w = StreamerWindow(streamer)
    sys.exit(app.exec_())  
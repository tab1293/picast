import sys
import os
import re
from threading import Thread
import json


from PyQt5 import QtCore, QtWidgets, QtGui
from PyQt5.QtWidgets import QApplication, QWidget, QDesktopWidget

from streamer import Streamer

import tornado.ioloop
import tornado.web
import requests
import urllib
from http_handler import HttpHandler

import os.path
from appdirs import *

import magic


class StreamerWindow(QWidget):
    
    def __init__(self, streamer):
        super().__init__()

        self._settings = self.loadSettings()
        self.initWatcher()
        self.initUI()
        self.updateFolderList()
        self.loadVideos()
        print (self._settings['videos'])

    def initWatcher(self):
        self.fs_watcher  = QtCore.QFileSystemWatcher(self._settings['folders'])
        self.fs_watcher.directoryChanged.connect(self.loadVideos)

        
    def initUI(self):

        self.folderList = QtWidgets.QListWidget()

        self.layout = QtWidgets.QVBoxLayout()
        self.layout.addWidget(QtWidgets.QLabel("Folders to monitor"))
        self.layout.addWidget(self.folderList)
        self.buttonLayout = QtWidgets.QHBoxLayout()
        self.buttonLayout.addStretch(1)
        self.addFolderButton = QtWidgets.QPushButton("Add folder")
        self.addFolderButton.clicked.connect(self.onAddFolderClicked)
        self.removeFolderButton = QtWidgets.QPushButton("Remove folder")
        self.removeFolderButton.clicked.connect(self.onRemoveFolderClicked)
        self.buttonLayout.addWidget(self.removeFolderButton)
        self.buttonLayout.addWidget(self.addFolderButton)
        self.layout.addLayout(self.buttonLayout)


        self.setLayout(self.layout)
        self.setGeometry(300, 300, 500, 400)
        self.setWindowTitle('PiCast')
        self.center()
        self.show()

    def center(self):
        qr = self.frameGeometry()
        cp = QDesktopWidget().availableGeometry().center()
        qr.moveCenter(cp)
        self.move(qr.topLeft())

    def loadSettings(self):
        self._settings_folder = user_data_dir("PiCast", "TAB")
        self._settings_file = self._settings_folder + "/settings.json"
        print(self._settings_file)

        if os.path.isfile(self._settings_file):
            with open(self._settings_file) as f:
                return json.load(f)
        else:
            if not os.path.exists(self._settings_folder):
                os.makedirs(self._settings_folder)

            with open(self._settings_file, 'w') as f:
                settings = {
                    'folders': [],
                    'videos': {}
                }
                json.dump(settings, f)

            return settings

    def writeSettings(self):
        with open(self._settings_file, 'w') as f:
            json.dump(self._settings, f)

    def onFolderChange(self, path):
        print(path)

    def onAddFolderClicked(self):
        fileDialog = QtWidgets.QFileDialog()
        fileDialog.setFileMode(QtWidgets.QFileDialog.Directory)
        fileDialog.setOption(QtWidgets.QFileDialog.ShowDirsOnly)
        fileDialog.setDirectory(os.path.expanduser('~'))
        fileDialog.exec()
        folders = fileDialog.selectedFiles()
        for folder in folders:
            self._settings['folders'].append(folder)

        self.initWatcher()
        self.updateFolderList()
        self.loadVideos()

    def updateFolderList(self):
        self.folderList.clear()
        for folder in self._settings['folders']:
            item = QtWidgets.QListWidgetItem(folder)
            item.setData(QtCore.Qt.UserRole, folder)
            self.folderList.addItem(item)

    def onRemoveFolderClicked(self):
        folderName = self.folderList.currentItem().text()
        row = self.folderList.currentRow()
        self.folderList.takeItem(row)
        self._settings['folders'].remove(folderName)
        self.updateFolderList()

    def loadVideos(self):
        mime = magic.Magic(mime=True)
        for folder in self._settings['folders']:
            q_dir = QtCore.QDir(folder)
            q_dir.setFilter(QtCore.QDir.Files)
            for f in q_dir.entryInfoList():
                mimeType = mime.from_file(f.absoluteFilePath())
                matchObj = re.match(r"video/.+$", mimeType.decode('utf-8'))
                if matchObj is not None and f.absoluteFilePath() not in self._settings['videos']:
                    self.parseVideo(f)

    def parseVideo(self, f):
        matchObj = re.match(r"((\w+\.)+)([0-9]{4})", f.fileName())
        if matchObj:
            title = matchObj.group(1).rstrip('.').replace('.', ' ')
            year = matchObj.group(3)
            info = self.fetchVideoInfo(title, year)
            info['filename'] = f.fileName()
            self._settings['videos'][f.absoluteFilePath()] = info
        else:
            self._settings['videos'][f.absoluteFilePath()] = {'filename': f.fileName()}

    def fetchVideoInfo(self, title, year):
        url = "http://www.omdbapi.com/?t={0}&y={1}&plot=short&r=json".format(urllib.parse.quote(title), urllib.parse.quote(year))
        r = requests.get(url)
        data = r.json()
        return data

    def getVideos(self):
        return self._settings['videos']

    def closeEvent(self, event):
        self.writeSettings()
        tornado.ioloop.IOLoop.instance().stop()
        
if __name__ == '__main__':
    
    app = QApplication(sys.argv)
    streamer = Streamer()
    w = StreamerWindow(streamer)

    web_app = tornado.web.Application([
        (r"/(set|play|pause|stop|list|test)", HttpHandler),
    ], debug=True, streamer=streamer, gui=w)
    web_app.listen(8888)
    t = Thread(target=lambda: tornado.ioloop.IOLoop.instance().start())
    t.start()

    sys.exit(app.exec_())  
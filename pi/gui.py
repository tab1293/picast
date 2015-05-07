import sys
from PyQt5 import QtCore, QtWidgets, QtGui
from PyQt5.QtWidgets import QApplication, QWidget, QDesktopWidget
from tornado import httpclient
import json

class PlayerWindow(QWidget):
    
    def __init__(self):
        super().__init__()
        self._http_client = httpclient.HTTPClient()

        self._videos = self.getVideoList()

        self.initUI()

    def initUI(self):

        self.fileList = QtWidgets.QListWidget()

        self.layout = QtWidgets.QVBoxLayout()
        self.layout.addWidget(self.fileList)
        for f in self._videos:
            item = QtWidgets.QListWidgetItem(f)
            # item.setData(QtCore.Qt.UserRole, f.filePath())
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

    def getVideoList(self):
        response = self._http_client.fetch("http://192.168.1.100:8888/list")
        print(response.body)
        data = json.loads(response.body.decode('utf-8'))
        print(data)
        return data['file_paths']


        
if __name__ == '__main__':
    
    app = QApplication(sys.argv)

    w = PlayerWindow()

    sys.exit(app.exec_())  
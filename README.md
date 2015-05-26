# picast

### OSX Install Instructions
Install homebrew
```
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```
Update brew
```
brew update
```
Install node
```
brew install node
```
Install electron
```
npm install electron-prebuilt -g
```
Install ffmpeg
```
brew install ffmpeg --with-fdk-aac --with-ffplay --with-freetype --with-libass --with-libquvi --with-libvorbis --with-libvpx --with-opus --with-x265
```
Change to the desktop directory
```
cd desktop/
```
Get react-devtools
```
git clone https://github.com/facebook/react-devtools.git
```
Change back up to the picast directory
```
cd ../
```
Run the app
```
electron desktop/
```
### Ubuntu Install Instructions
Install nodejs and npm
```
sudo apt-get install nodejs npm
```
Install electron
```
npm install electron-prebuilt -g
```
Install ffmpeg following these <a href="">compile instructions</a> or use the <a href="http://ffmpeg.org/download.html">PPA from ffmpeg</a>. Just make sure ffmpeg is linked in /usr/bin/
Change to the desktop directory
```
cd desktop/
```
Get react-devtools
```
git clone https://github.com/facebook/react-devtools.git
```
Change back up to the picast directory
```
cd ../
```
Run the app
```
electron desktop/

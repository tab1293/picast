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
cd desktop.
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

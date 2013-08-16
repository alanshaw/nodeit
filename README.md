![nodeit logo](https://raw.github.com/alanshaw/nodeit/master/design/icon_128x128.png)

# nodeit [![Dependency Status](https://david-dm.org/alanshaw/nodeit.png)](https://david-dm.org/alanshaw/nodeit) [![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges)

> NodeJS text editor

Oh my god this is super alpha, but, [download the latest version (OSX)](http://nodeit.org/dist/).

Nodeit is built in HTML, CSS and JavaScript, using browserify to load Node modules. The idea is that it talks to a defined native bridge to do the things a web page can't do on the OS, such as save and read files from disk. Since it is on the most part just a web page, it means it'll be easy to port to different platforms, the only work needing to be done is to create a bridge for the platform. It also means that we can do exciting things like create bridges for CounchDB, GitHub, localstorage etc...

## Getting started

Install dependencies:

```sh
npm install
```

Build:

```sh
grunt
```

## Credits

* [Icons](http://www.wpzoom.com/wpzoom/new-freebie-wpzoom-developer-icon-set-154-free-icons/)
* [Chrome Tabs](https://github.com/adamschwartz/chrome-tabs)
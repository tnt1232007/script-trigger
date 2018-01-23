const { app, BrowserWindow, Menu, Tray, shell } = require('electron');
const path = require('path');
const url = require('url');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let tray;

const createWindow = () => {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: path.join(__dirname, 'favicon.ico'),
  });
  win.setMenu(null);

  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  tray = new Tray(path.join(__dirname, 'favicon.ico'));
  tray.setToolTip('Script Trigger')
  tray.on('double-click', () => win.show());
  var contextMenu = Menu.buildFromTemplate([
    { label: 'Show', click: () => win.show() },
    { label: 'Exit', click: () => app.quit() }
  ]);
  tray.setContextMenu(contextMenu);

  win.on('minimize', event => {
    event.preventDefault();
    win.hide();
  });

  win.on('closed', () => {
    win = null;
    tray = null;
  });

  var handleRedirect = (e, url) => {
    if (url != win.webContents.getURL()) {
      e.preventDefault()
      shell.openExternal(url)
    }
  }

  win.webContents.on('will-navigate', handleRedirect)
  win.webContents.on('new-window', handleRedirect)
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});
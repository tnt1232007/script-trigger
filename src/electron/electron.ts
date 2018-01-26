import { app, shell, BrowserWindow, Menu, Tray } from 'electron';
import * as path from 'path';
import * as url from 'url';

const prodMode = !require('electron-is-dev');
const cwd = prodMode ? __dirname : path.join(__dirname, '..');
let win: Electron.BrowserWindow;
let tray: Electron.Tray;

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: path.join(cwd, 'favicon.ico'),
  });

  const urlObject = prodMode
    ? { pathname: path.join(cwd, 'index.html'), protocol: 'file:', slashes: true, }
    : { pathname: 'localhost:4200', protocol: 'http:', slashes: true };
  win.loadURL(url.format(urlObject));

  tray = new Tray(path.join(cwd, 'favicon.ico'));
  tray.setToolTip('ScriptTrigger');
  tray.on('double-click', () => win.show());
  const contextMenu = Menu.buildFromTemplate([
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

  const handleRedirect = (e, url_) => {
    if (url_ !== win.webContents.getURL()) {
      e.preventDefault();
      shell.openExternal(url_);
    }
  };

  win.webContents.on('will-navigate', handleRedirect);
  win.webContents.on('new-window', handleRedirect);
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  if (prodMode)
    createWindow();
  else
    setTimeout(createWindow, 10000);
});

app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

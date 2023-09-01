import { join } from 'node:path';
import {
  app,
  BrowserWindow,
  clipboard,
  ipcMain,
  globalShortcut,
  Notification,
  Tray,
  Menu,
  nativeImage,
} from 'electron';

import Positioner from 'electron-positioner';

let lastClipboardContent: string = '';
let lastClipboardImageDataURL: string = ''

let tray: Tray | null = null;
let mainWindow: BrowserWindow;

const createWindow = () => {
   mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    minHeight: 400,
    minWidth: 300,
    maxHeight: 800,
    maxWidth: 450,
    maximizable: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    show: false,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: true, 
      contextIsolation:true
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
  return mainWindow;
};

app.on('ready', () => {
 createWindow();
  mainWindow.webContents.openDevTools()
  tray = new Tray('./src/icons/trayTemplate.png');
  tray.setToolTip('This is my application.')
  tray.setIgnoreDoubleClickEvents(true);
  
  setInterval(() => {
    const currentImage = clipboard.readImage();

    const currentImageDataURL = currentImage.toDataURL();

    // Check if an image is present in the clipboard and if it's different from the last one
    if (currentImageDataURL !== lastClipboardImageDataURL) {
      lastClipboardImageDataURL = currentImageDataURL;
      // Send the image to the renderer process or handle it accordingly
      mainWindow.webContents.send('keyboardCopyPressed', currentImageDataURL);
    } else {
      const currentClipboardContent = clipboard.readHTML();
      if (currentClipboardContent !== lastClipboardContent) {
        lastClipboardContent = currentClipboardContent;
        // Send the text to the renderer process
        mainWindow.webContents.send('keyboardCopyPressed', currentClipboardContent);
      }
    }
  }, 500); 
  
  const positioner = new Positioner(mainWindow);

  tray.on('click', () => {
    if (!tray) return;

    if (mainWindow.isVisible()) {
      return mainWindow.hide();
    }

    const trayPosition = positioner.calculate('trayCenter', tray.getBounds());

    mainWindow.setPosition(trayPosition.x, trayPosition.y, false);
    mainWindow.show();
  });

  // globalShortcut.register('CommandOrControl+C', () => {
  //   // Simulate the CMD+C keypress to allow the default copy action
  //   robot.keyTap('c', 'command');

  //   // Delay your custom logic slightly to ensure the default copy action has time to complete
  //   setTimeout(() => {
  //     let content = clipboard.readText();
  //     mainWindow.webContents.send('keyboardCopyPressed', content);
  //   }, 100); // 100ms delay, adjust if needed
  // });

  // globalShortcut.register('CommandOrControl+Shift+Alt+X', () => {
  //   let content = clipboard.readText();
  //   mainWindow.webContents.send('keyboardCopyPressed', content);
  // });
});

app.on('quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('write-to-clipboard', (_, content: string) => {
  clipboard.writeText(content);
});

ipcMain.handle('read-from-clipboard', (_) => {
  return clipboard.readText();
});

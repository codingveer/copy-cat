import { contextBridge, ipcRenderer } from 'electron';

const api = {
  ipcRenderer: {
    send: ipcRenderer.send,
    on: ipcRenderer.on,
    once: ipcRenderer.once,
    removeListener: ipcRenderer.removeListener
  },
  keyboardCopyPressed: (callback) => ipcRenderer.on("keyboardCopyPressed", callback),
  writeToClipboard: (content: string) => {
    ipcRenderer.send('write-to-clipboard', content);
  },

  readFromClipboard: (): Promise<string> => {
    return ipcRenderer.invoke('read-from-clipboard');
  }
} as const;

contextBridge.exposeInMainWorld('api', api);

export type Api = typeof api;

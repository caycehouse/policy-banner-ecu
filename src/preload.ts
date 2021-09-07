import { contextBridge, ipcRenderer } from "electron";

// The API relays method calls to the main process using `ipcRenderer` methods.
// It does not provide direct access to `ipcRenderer` or other Electron or Node APIs.
export const RendererApi = {
  closeApp: (): void => {
    ipcRenderer.send("closeApp");
  },
  loadPreferences: () => ipcRenderer.invoke('load-prefs')
};

// SECURITY: expose a limted API to the renderer over the context bridge
// https://github.com/1password/electron-secure-defaults/SECURITY.md#rule-3
contextBridge.exposeInMainWorld("api", RendererApi);

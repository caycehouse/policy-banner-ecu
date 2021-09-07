/* eng-disable PRELOAD_JS_CHECK */

import { app, BrowserWindow, ipcMain, Session, session } from "electron";
import * as path from "path";
import * as username from "username";
import * as storage from "electron-json-storage";
import * as os from 'os';
import * as fs from 'fs';

const appFolder = path.dirname(process.execPath)
const updateExe = path.resolve(appFolder, '..', 'Update.exe')
const exeName = path.basename(process.execPath)

if (process.platform === "darwin") {
  storage.setDataPath("/usr/local/ECU/policy-banner-ecu");
} else {
  storage.setDataPath("C:\\ITCS\\policy-banner-ecu");
}

app.setLoginItemSettings({
  openAtLogin: true,
  path: updateExe,
  args: [
    '--processStart', `"${exeName}"`,
    '--process-start-args', `"--hidden"`
  ]
})

function createWindow(session: Session) {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // SECURITY: use a custom session without a cache
      // https://github.com/1password/electron-secure-defaults/#disable-session-cache
      session,
      // SECURITY: disable node integration for remote content
      // https://github.com/1password/electron-secure-defaults/#rule-2
      nodeIntegration: false,
      // SECURITY: enable context isolation for remote content
      // https://github.com/1password/electron-secure-defaults/#rule-3
      contextIsolation: true,
      // SECURITY: disable the remote module
      // https://github.com/1password/electron-secure-defaults/#remote-module
      enableRemoteModule: false,
      // SECURITY: sanitize JS values that cross the contextBridge
      // https://github.com/1password/electron-secure-defaults/#rule-3
      worldSafeExecuteJavaScript: true,
      // SECURITY: restrict dev tools access in the packaged app
      // https://github.com/1password/electron-secure-defaults/#restrict-dev-tools
      devTools: !app.isPackaged,
      // SECURITY: disable navigation via middle-click
      // https://github.com/1password/electron-secure-defaults/#disable-new-window
      disableBlinkFeatures: "Auxclick",
      // SECURITY: sandbox renderer content
      // https://github.com/1password/electron-secure-defaults/#sandbox
      sandbox: true,
    },
    width: 800,
    frame: false,
    resizable: false,
    skipTaskbar: true,
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "../index.html"));

  const data: any = storage.getSync('prefs');
  if (data.logging) {
    mainWindow.setFullScreen(true);
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
}

// SECURITY: sandbox all renderer content
// https://github.com/1password/electron-secure-defaults/#sandox
app.enableSandbox();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  // SECURITY: use a custom persistent session without a cache
  // https://github.com/1password/electron-secure-defaults/#disable-session-cache
  const secureSession = session.fromPartition("persist:app", {
    cache: false,
  });

  createWindow(secureSession);

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow(secureSession);
  });

  // SECURITY: deny permission requests from renderer
  // https://github.com/1password/electron-secure-defaults/#rule-4
  secureSession.setPermissionRequestHandler(
    (_webContents, _permission, callback) => {
      callback(false);
    }
  );

  // SECURITY: define a strict CSP
  // https://github.com/1password/electron-secure-defaults/#rule-6
  secureSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: /* eng-disable CSP_GLOBAL_CHECK */ {
        ...details.responseHeaders,
        'Content-Security-Policy': ['default-src \'self\'']
      },
    });
  });
});

app.on('before-quit', event => {
  event.preventDefault() // prevent the process from ending
})

app.on('browser-window-blur', (event, bw) => {
  bw.restore()
  bw.focus()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("web-contents-created", (_ev, contents) => {
  // SECURITY: verify webview options before creation
  // https://github.com/1password/electron-secure-defaults/#rule-11
  const preventDefault = (ev: Electron.Event) => {
    ev.preventDefault();
  };
  contents.on("will-attach-webview", preventDefault);

  // SECURITY: disable or limit navigation
  // https://github.com/1password/electron-secure-defaults/#rule-12
  contents.on("will-navigate", preventDefault); // eng-disable LIMIT_NAVIGATION_GLOBAL_CHECK

  // SECURITY: disable or limit creation of new windows
  // https://github.com/1password/electron-secure-defaults/#rule-13
  contents.on("new-window", preventDefault); // eng-disable LIMIT_NAVIGATION_GLOBAL_CHECK

  // SECURITY: further prevent new window creation
  // https://github.com/1password/electron-secure-defaults/#prevent-new-window
  contents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// Handle messages and invocations coming from the renderer API

ipcMain.on('closeApp', () => {
  const data: any = storage.getSync('prefs');

  if (data.logging) {
    // Log acceptance of policy.
    const record = os.hostname() + " - " + username.sync() + " - " + new Date() + "\r\n";
    console.log(record);

    fs.writeFileSync(data.loggingLocation, record, { flag: 'a+' });
  }

  process.exit();
})

ipcMain.handle('load-prefs', () => {
  /*storage.set('prefs',
    {
      title1: 'Information Technology and Computing Services',
      title2: 'Student Computer Labs',
      title3: 'By clicking Accept below, you acknowledge this statement:',
      title4: 'In order to uphold university standards and best practices, students must follow all academic integrity policies. Failure to comply with all ECU academic integrity policies may result in the involvement of the Office of Student Rights and Responsibilities. Due to academic integrity policies, the ECU Proctoring Center video records all testing candidates throughout the duration of his/her exam.',
      body: 'ECU computing services (including, but not limited to, ECU computing and printing systems and the ECU network) are provided “as-is” and ECU makes no, and expressly disclaims any and all, representations and warranties whatsoever, express or implied, concerning the ECU computing services and your use thereof, including but not limited to the warranties of merchantability or fitness for a particular purpose; that the ECU computing services will function as intended; be uninterrupted or error-free; be free from malware or viruses or other malicious software, that your use of the ECU computing services will not infringe third-party rights; or that the ECU computing services will be secure from unauthorized third-party access. Any business or other personal transactions undertaken by you using ECU Computing Services, including, but not limited to, those involving the use of credit or debit cards or access to or transmission of confidential personal information, such as healthcare or financial information, are done at your own risk. By using the ECU computing services you expressly agree to hold harmless and covenant not to sue East Carolina University for and against any and all claims, injuries, or damages arising from or relating to your use of the ECU computing services.',
      logging: true,
      loggingLocation: "/Users/caycehouse/Downloads/log.txt"
    },
    function (error) {
      if (error) throw error;
    });*/

  const data: any = storage.getSync('prefs');

  return data
})

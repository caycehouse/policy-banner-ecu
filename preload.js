// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    // Retrieve remote BrowserWindow
    const { BrowserWindow } = require("electron").remote;

    // Close app
    document.getElementById("close-btn").addEventListener("click", e => {
        var window = BrowserWindow.getFocusedWindow();
        window.close();
    });
})
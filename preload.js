// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    // Retrieve remote BrowserWindow
    const { BrowserWindow } = require("electron").remote;
    const username = require('username');
    const os = require('os');
    const fs = require('fs');

    // Close app
    document.getElementById("close-btn").addEventListener("click", e => {
        // Log acceptance of policy.
        let record = os.hostname() + " - " + username.sync() + " - " + new Date() + "\r\n";
        console.log(record);

        fs.writeFileSync("T:\\policy-banner.txt", record, { flag: 'a+' }, function (err) {
            if (err) throw err;
            console.log("It's saved!");
        });

        // Close application.
        var window = BrowserWindow.getFocusedWindow();
        window.close();
    });
})
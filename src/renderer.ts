// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.

// Message will be logged in the main process (stdout)
const btn = document.getElementById('closeApp');

if(btn !== null) {
  btn.onclick = () => {
    window.api.closeApp();
  };
}

// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', async () => {
  const replaceText = (selector: string, text: string) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  const data: any = await window.api.loadPreferences();

  replaceText('title1', data.title1 ? data.title1 : '')
  replaceText('title2', data.title2 ? data.title2 : '')
  replaceText('title3', data.title3 ? data.title3 : '')
  replaceText('title4', data.title4 ? data.title4 : '')
  replaceText('body', data.body ? data.body : '')
})
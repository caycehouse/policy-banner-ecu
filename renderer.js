(function() {
  // Retrieve remote BrowserWindow
  const { BrowserWindow } = require("electron").remote;

  function init() {
    // Close app
    document.getElementById("close-btn").addEventListener("click", e => {
      var window = BrowserWindow.getFocusedWindow();
      window.close();
    });
  }

  document.onreadystatechange = () => {
    if (document.readyState == "complete") {
      init();
    }
  };
})();

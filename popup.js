(function () {
  "use strict";
  var STORAGE_KEY = "facebookZenEnabled";
  var toggle = document.getElementById("enabled");
  var status = document.getElementById("status");

  function showStatus() {
    status.textContent = toggle.checked ? "Filtering is on." : "Filtering is off.";
  }

  chrome.storage.local.get({ [STORAGE_KEY]: true }, function (settings) {
    toggle.checked = settings[STORAGE_KEY] !== false;
    showStatus();
  });

  toggle.addEventListener("change", function () {
    chrome.storage.local.set({ [STORAGE_KEY]: toggle.checked }, showStatus);
  });
})();

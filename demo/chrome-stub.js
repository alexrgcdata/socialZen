// Fictional local demo only. This is not loaded by the extension manifest.
(function () {
  var listener = function () {};
  window.chrome = {
    runtime: { getURL: function (path) { return '../' + path; } },
    storage: {
      local: { get: function (defaults, cb) { cb(defaults); } },
      onChanged: { addListener: function (cb) { listener = cb; } }
    }
  };
  document.getElementById('demo-enabled').addEventListener('change', function (event) {
    listener({ facebookZenEnabled: { newValue: event.target.checked } }, 'local');
  });
})();

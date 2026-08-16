(function () {
  "use strict";

  var STORAGE_KEY = "facebookZenEnabled";
  var PREVIEW_MS = 4000;
  var enabled = true;
  var observer = null;
  var refreshTimer = null;
  var processed = new WeakSet();
  var previewTimers = new WeakMap();
  var controlMap = new WeakMap();
  var logoUrl = chrome.runtime.getURL("assets/socialzen-logo.svg");

  // These fallbacks keep the extension functional if an older browser tab
  // has a stale manifest and does not load keywords.js yet.
  var FALLBACK_BLOCK_KEYWORDS = ["socialzen test", "trump", "biden", "white house", "truth social", "politics", "check", "cool", "heart", "love", "look", "at"];

  var style = document.createElement("style");
  style.id = "facebookzen-styles";
  style.textContent = [
    ".facebookzen-filtered { max-height: 210px !important; overflow: hidden !important; position: relative !important; filter: blur(10px) !important; opacity: .35 !important; }",
    "[data-facebookzen-controls] { position: absolute !important; z-index: 2147483647 !important; display: flex !important; flex-direction: column !important; align-items: flex-end !important; gap: 6px !important; font-family: Arial, sans-serif !important; }",
    "[data-facebookzen-label] { background: rgba(20, 20, 24, .82) !important; color: #fff !important; border-radius: 999px !important; padding: 5px 9px !important; font-size: 11px !important; line-height: 1 !important; white-space: nowrap !important; box-shadow: 0 2px 8px rgba(0,0,0,.2) !important; }",
    "[data-facebookzen-button] { border: 0 !important; border-radius: 999px !important; padding: 6px 10px !important; background: #f5c542 !important; color: #17130a !important; cursor: pointer !important; font-size: 11px !important; font-weight: 700 !important; box-shadow: 0 2px 8px rgba(0,0,0,.25) !important; }",
    "[data-facebookzen-button]:hover { background: #ffd866 !important; }",
    "[data-facebookzen-watermark] { width: 70px !important; height: auto !important; opacity: .72 !important; border-radius: 6px !important; }",
    ".facebookzen-preview { max-height: none !important; overflow: visible !important; filter: none !important; opacity: 1 !important; }",
    "[data-socialzen-status] { position: fixed !important; left: 12px !important; bottom: 12px !important; z-index: 2147483647 !important; padding: 7px 10px !important; border-radius: 999px !important; background: #0c7c70 !important; color: #fff !important; font: 700 11px Arial, sans-serif !important; box-shadow: 0 3px 14px rgba(0,0,0,.25) !important; pointer-events: none !important; }"
  ].join("\n");
  (document.head || document.documentElement).appendChild(style);

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  function includesKeyword(text, keywords) {
    return keywords.some(function (keyword) {
      var phrase = normalize(keyword);
      return phrase && text.indexOf(phrase) !== -1;
    });
  }

  function articleText(article) {
    return normalize(article.innerText || article.textContent || "");
  }

  function hasUsableText(element) {
    if (!element) return false;
    var text = element.innerText || element.textContent || "";
    return text.trim().length >= 20 && text.length <= 12000;
  }

  function isCandidate(element) {
    if (!element || element.nodeType !== 1) return false;
    var isRoleArticle = element.matches("[role='article']");
    var isFeedUnit = element.matches("[data-pagelet*='FeedUnit']");
    if (!isRoleArticle && !isFeedUnit) return false;
    if (isRoleArticle && element.parentElement && element.parentElement.closest("[role='article']")) return false;
    if (isFeedUnit && element.parentElement && element.parentElement.closest("[role='article'], [data-pagelet*='FeedUnit']")) return false;
    return hasUsableText(element);
  }

  function messagePostRoot(message) {
    var node = message;
    var best = null;
    for (var depth = 0; node && node !== document.body && depth < 16; depth += 1, node = node.parentElement) {
      if (node.querySelector("[aria-label^='Actions for this post']") && hasUsableText(node)) best = node;
    }
    return best;
  }

  function getArticles(root) {
    var found = [];
    if (root && isCandidate(root)) found.push(root);
    if (root && root.querySelectorAll) {
      Array.prototype.forEach.call(root.querySelectorAll("[role='article'], [data-pagelet*='FeedUnit']"), function (article) {
        if (isCandidate(article)) found.push(article);
      });
      Array.prototype.forEach.call(root.querySelectorAll("[data-ad-preview='message']"), function (message) {
        var postRoot = messagePostRoot(message);
        if (postRoot) found.push(postRoot);
      });
    }
    return found.filter(function (article, index) {
      return found.indexOf(article) === index;
    });
  }

  function showStatusBadge() {
    var badge = document.querySelector("[data-socialzen-status]");
    if (!enabled) {
      if (badge) badge.remove();
      return;
    }
    if (!badge) {
      badge = document.createElement("div");
      badge.setAttribute("data-socialzen-status", "true");
      badge.textContent = "SocialZen active";
      (document.body || document.documentElement).appendChild(badge);
    }
  }

  function addControls(article) {
    var controls = document.createElement("div");
    controls.setAttribute("data-facebookzen-controls", "true");

    var label = document.createElement("div");
    label.setAttribute("data-facebookzen-label", "true");
    label.textContent = "Political content filtered";

    var watermark = document.createElement("img");
    watermark.setAttribute("data-facebookzen-watermark", "true");
    watermark.alt = "SocialZen by Alex Seidler";
    watermark.src = logoUrl;

    var button = document.createElement("button");
    button.type = "button";
    button.setAttribute("data-facebookzen-button", "true");
    button.textContent = "Temporarily Show";
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      article.classList.remove("facebookzen-filtered");
      article.classList.add("facebookzen-preview");
      controls.style.display = "none";
      window.clearTimeout(previewTimers.get(article));
      previewTimers.set(article, window.setTimeout(function () {
        article.classList.remove("facebookzen-preview");
        article.classList.add("facebookzen-filtered");
        controls.style.display = "flex";
        positionControls(article, controls);
      }, PREVIEW_MS));
    });

    controls.appendChild(label);
    controls.appendChild(watermark);
    controls.appendChild(button);
    controls.__socialZenArticle = article;
    controlMap.set(article, controls);
    (document.body || document.documentElement).appendChild(controls);
    positionControls(article, controls);
  }

  function positionControls(article, controls) {
    if (!article || !controls || controls.style.display === "none") return;
    var rect = article.getBoundingClientRect();
    controls.style.top = Math.max(8, rect.top + window.scrollY + 8) + "px";
    controls.style.left = Math.max(8, rect.right + window.scrollX - controls.offsetWidth - 8) + "px";
  }

  function positionAllControls() {
    Array.prototype.forEach.call(document.querySelectorAll("[data-facebookzen-controls]"), function (controls) {
      positionControls(controls.__socialZenArticle, controls);
    });
  }

  function removeControls(article) {
    var controls = controlMap.get(article);
    if (controls) controls.remove();
    controlMap.delete(article);
  }

  function shouldBlock(article) {
    var text = articleText(article);
    var blockKeywords = typeof BLOCK_KEYWORDS !== "undefined" && Array.isArray(BLOCK_KEYWORDS) ? BLOCK_KEYWORDS : FALLBACK_BLOCK_KEYWORDS;
    var overrideKeywords = typeof OVERRIDE_KEYWORDS !== "undefined" && Array.isArray(OVERRIDE_KEYWORDS) ? OVERRIDE_KEYWORDS : [];
    if (!text || includesKeyword(text, overrideKeywords)) return false;
    return includesKeyword(text, blockKeywords);
  }

  function processArticle(article) {
    if (!article || !document.documentElement.contains(article)) return;
    var blocked = enabled && shouldBlock(article);
    if (blocked) {
      if (!controlMap.get(article)) addControls(article);
      article.classList.add("facebookzen-filtered");
      article.classList.remove("facebookzen-preview");
      positionControls(article, controlMap.get(article));
    } else {
      window.clearTimeout(previewTimers.get(article));
      article.classList.remove("facebookzen-filtered", "facebookzen-preview");
      removeControls(article);
    }
    processed.add(article);
  }

  function scan(root) {
    getArticles(root || document).forEach(processArticle);
  }

  function applyEnabledState(value) {
    enabled = value !== false;
    showStatusBadge();
    scan(document);
  }

  function start() {
    chrome.storage.local.get({ [STORAGE_KEY]: true }, function (settings) {
      applyEnabledState(settings[STORAGE_KEY]);
      observer = new MutationObserver(function (mutations) {
        var shouldScan = mutations.some(function (mutation) {
          return mutation.addedNodes && mutation.addedNodes.length;
        });
        if (!shouldScan) return;
        window.clearTimeout(refreshTimer);
        refreshTimer = window.setTimeout(function () { scan(document); }, 120);
      });
      observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
      window.addEventListener("scroll", positionAllControls, { passive: true });
      window.addEventListener("resize", positionAllControls);
    });

    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area === "local" && changes[STORAGE_KEY]) applyEnabledState(changes[STORAGE_KEY].newValue);
    });
  }

  start();
})();

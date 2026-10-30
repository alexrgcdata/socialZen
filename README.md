# SocialZen

I built SocialZen because I was tired of political posts taking over my Facebook feed. I wanted a way to choose the subjects I did not want to see and give myself a break from them.

SocialZen is a small browser extension that matches the words you choose and masks those posts with CSS. The included list starts with politics and arguments, but you can replace it with any subjects you want to avoid.

[Project page](https://alexseidler.dev/work/socialzen/) | [Download v1.0.2](https://alexseidler.dev/downloads/socialzen/socialzen-1.0.2.zip)

![Fictional feed demonstration using the actual SocialZen masking code](demo/socialzen-demo.jpg)

The image uses fictional people and posts. It is not a screenshot of Facebook.

## Install in Chrome or Edge

1. Download and extract the ZIP. Keep the extracted folder somewhere permanent.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable **Developer mode**, choose **Load unpacked**, and select the folder containing `manifest.json`.
4. Open or reload Facebook. Pin SocialZen to reach its on/off switch.

There is no build step, account, API key, or subscription. This is a manual unpacked installation, not a Chrome Web Store release. The offline `installation-guide.html` has the same setup steps. The packaged extension targets desktop Chrome and Edge; Safari and mobile-browser installation are not supported by this package.

## Choose your keywords

Edit `keywords.js` in a text editor. For example:

```js
var BLOCK_KEYWORDS = ["election", "campaign", "spoiler"];
var OVERRIDE_KEYWORDS = ["community fundraiser"];
```

Replace the existing arrays rather than adding a second copy. Keep each phrase in quotes, separated by commas. Reload the extension on its extensions page, then reload Facebook. There is no keyword editor in the popup.

Matching ignores capitalization, repeated whitespace, and curly apostrophes. It uses substrings, not whole words or AI: `vote` also matches `devoted`. An override keeps the entire post visible even if a blocked term also appears. Broad keywords can mask posts you wanted to keep.

## How it works

The content script looks for Facebook post containers and checks their rendered text. Matching posts are blurred, faded, and shortened. **Temporarily Show** reveals a post for four seconds before the mask returns. The popup switch disables or enables filtering; its setting stays in `chrome.storage.local`.

A `MutationObserver` watches newly loaded and changed feed content, with a short delay to combine changes before scanning. Controls sit outside the blurred post so they remain readable. Filtering changes the page in your browser. It does not delete posts, unfollow people, or change your Facebook account.

## Privacy and limits

The extension code has no analytics, external API calls, or remote filtering service. Its only declared API permission is `storage`, with host access limited to the Facebook domains listed in `manifest.json`. The popup contains an ordinary link to rgcdata.com; opening it visits that website.

This is a text filter. It cannot understand context, recognize words inside images or video, or guarantee every post will be found. Facebook markup can change. The observer still rescans candidate posts across the page, so very long feeds may need performance work.

Version 1.0.2 was checked with automated DOM fixtures and a browser demonstration using fictional posts and a stubbed extension API. Those checks do not establish current coverage of a signed-in Facebook feed or a native Chrome/Edge installation. The screenshot is explicitly labeled as a fictional demonstration.

## Development checks

Node.js 20+ is used for development tests only:

```sh
npm ci
npm test
```

The tests cover keyword matching, overrides, delayed posts, the temporary reveal, disabling during a reveal, and removed posts. `demo/index.html` runs the actual content script against fictional feed markup using a small local Chrome API stub. Serve the repository over localhost to view it. The demo never connects to Facebook.

## Version 1.0.2

- Restored the missing extension icon and logo.
- Kept a temporary reveal open across feed rescans and hid its controls correctly.
- Removed controls and timers for detached posts; watched text changes as well as added posts.
- Removed broad fallback test words. A missing keyword file now leaves posts visible.
- Updated labels, documentation, and a fictional demo to explain configurable keyword filtering.

By [Alex Seidler](https://alexseidler.dev). No project-wide software license has been selected; public source access does not itself grant a reuse license.

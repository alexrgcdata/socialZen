# SocialZen Political Filter

SocialZen is a tiny, private browser extension by **Alex Seidler** that soft-hides political and high-drama Facebook posts. It does not delete anything, send data anywhere, or use an external service.

Website: [rgcdata.com](https://rgcdata.com)

## Install in Chrome or Edge

1. Download the project ZIP from GitHub.
2. Unzip the ZIP file. Keep the unzipped folder somewhere easy to find.
3. Open your browser's extensions page:
   - Chrome: open `chrome://extensions`
   - Edge: open `edge://extensions`
4. Turn on **Developer mode**.
5. Click **Load unpacked**.
6. Select the unzipped SocialZen folder—the folder containing `manifest.json`.
7. Open Facebook and use the small SocialZen toolbar button to turn filtering on or off.

Chrome and Edge use the same unpacked-extension process for this project. The extension uses standard Manifest V3 APIs, `chrome.storage.local`, and `MutationObserver`, so no browser-specific build is needed for either one.

## Editing the word lists

Open `keywords.js` in any text editor.

- `BLOCK_KEYWORDS` contains words and phrases that can trigger the soft hide.
- `OVERRIDE_KEYWORDS` is empty by default. Add a phrase there when you want matching posts to remain visible even if they also contain a blocked phrase.

Save the file, then reload Facebook. If the browser is still using the old file, reload the extension from its extensions page.

## What it does

Matching Facebook posts are blurred, faded, shortened, and marked **Political content filtered**. Click **Temporarily Show** to read one for four seconds. The filter then returns automatically. New posts loaded while scrolling are also checked.

## Browser notes

This first release is designed and tested for unpacked Chrome and Edge extensions on Windows. Safari uses a different extension packaging workflow, so Safari support is a follow-up step rather than a claim that this exact folder is already Safari-ready.

## A tiny plug

Need a custom tool, system integration, or database work? Alex Seidler — Full Stack Developer (FileMaker * Web * Mobile) — and [rgcdata.com](https://rgcdata.com) build practical software for that too.

> From backend systems to frontend user experiences — I’d love to discuss a project.

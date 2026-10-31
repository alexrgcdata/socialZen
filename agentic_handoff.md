# SocialZen agent handoff

Updated: October 30, 2026. This handoff is safe to publish with the source.

## Current state

SocialZen is a small Manifest V3 browser extension by Alex Seidler. It compares Facebook post text with editable keyword lists and uses CSS to blur, fade, and shorten matches. The popup switches filtering on or off. A separate control reveals a post for four seconds. Keywords are edited in `keywords.js`, not in the popup; override phrases take priority over blocked phrases.

The current published package is **v1.0.3 prerelease**, intended for manual unpacked installation in desktop Chrome or Edge. It requires no build, account, API key, or subscription. There is no browser-store release, Safari package, or mobile-browser installation package.

Canonical checkout for this work: `C:\Projects\socialZen`, branch `main`.

## Source and release references

- [Repository](https://github.com/alexrgcdata/socialZen)
- [README at the release commit](https://github.com/alexrgcdata/socialZen/blob/v1.0.3/README.md)
- [Stuck-mask fix, commit 1efb9f4](https://github.com/alexrgcdata/socialZen/commit/1efb9f4)
- [Documentation review, commit ea06464](https://github.com/alexrgcdata/socialZen/commit/ea06464)
- [Release preparation, commit 16e206c4b45e215bc5adc5bf9538b233369ccc75](https://github.com/alexrgcdata/socialZen/commit/16e206c4b45e215bc5adc5bf9538b233369ccc75)
- [Tag and prerelease v1.0.3](https://github.com/alexrgcdata/socialZen/releases/tag/v1.0.3)
- [Manual-extension ZIP](https://github.com/alexrgcdata/socialZen/releases/download/v1.0.3/socialzen-1.0.3.zip)
- [Published SHA-256 file](https://github.com/alexrgcdata/socialZen/releases/download/v1.0.3/socialzen-1.0.3.sha256)
- [Published per-file hash receipt](https://github.com/alexrgcdata/socialZen/releases/download/v1.0.3/socialzen-1.0.3.json)

The ZIP is **98,633 bytes**, with SHA-256:

```text
54a48887f8b9adc3fb288da19a30589fe86b2ea1ab2e3a9421783da3e4359262
```

Version 1.0.3 fixes a mask that could remain when an already filtered post changed to text below the scanner's discovery minimum. The scanner now revisits known masked posts so changed text and the off switch can clear them. The published ZIP includes that fix.

The [v1.0.2 release](https://github.com/alexrgcdata/socialZen/releases/tag/v1.0.2), its tag, and its ZIP were preserved. Its tag points to `d3216076e2ae9598e540f71ea4795ecb4ff538a6`; its ZIP SHA-256 remains `cca4a52adec12cd8b9c024dd10fea30e7937e43d041dc4f47e6adf1dfd350433`.

This handoff is a documentation addition after the v1.0.3 release commit. It is not present in the existing v1.0.3 ZIP. Neither that ZIP nor its tag should be replaced to add it.

## Verification already performed

These are recorded results from release preparation, not newly repeated checks during this handoff update:

- Seven `npm test` tests passed in the source checkout and again after a fresh extraction of the exact packaged ZIP. The environment was Node.js 24.14.0 and npm 11.9.0.
- Tests cover normalized matching and overrides, substring matching and missing lists, new/changed/removed posts, temporary reveal across rescans, disabling during a reveal, shortened-post unmasking, and disabling a known post that discovery now skips.
- Tests use jsdom and a simulated extension API. They shorten the reveal timer from four seconds to 650 ms to check state changes. They do not verify native browser timing, rendering, or real popup/storage integration.
- JavaScript syntax checks passed for the content script, popup, keyword file, and demo stub.
- The 17-file packaging allow-list was reviewed. ZIP CRC, manifest resources, matching version fields, and each packaged file's hash against the committed source were verified. No installed dependencies, private files, or Git metadata were included.
- The published v1.0.3 asset was downloaded and its SHA-256, ZIP CRC, and manifest version were verified. GitHub's asset digest matched the local receipt. The remote prerelease flag and tag target were verified, as were the unchanged v1.0.2 tag and asset digest.
- The earlier browser demo exercised the real masking code with fictional posts and a local extension API stub. `demo/socialzen-demo.jpg` is explicitly labeled as a fictional demonstration, not a Facebook screenshot.

The local ignored `release/` directory retains the ZIP, checksum, per-file receipt, release notes, and `published-verification-1.0.3.json`. The public release assets provide the portable evidence.

## Acceptance still outstanding

- Native unpacked installation in current desktop Chrome and Edge.
- Real popup/storage behavior between the popup and an installed content script.
- Current signed-in Facebook feed coverage, including scrolling, changed posts, and control placement. No account or private-feed work was performed for this release.

The extension matches text substrings, so broad words can mask unrelated posts. It does not interpret context or read text inside images or video. CSS masking changes the presentation; the post text remains in the page. Facebook markup changes may affect discovery, and rescanning candidates across a long feed may need performance work.

The code has no analytics, remote filtering API, or AI service. It declares `storage` permission and Facebook host access. The popup's ordinary rgcdata.com link visits that website only if opened. No project-wide reuse license has been selected; preserve that status rather than adding licensing terms on Alex's behalf.

## Next steps and ownership

1. PROJECT MANAGER owns portfolio code, generated pages, and deployment. Use the exact verified v1.0.3 GitHub asset URL and hash above when updating the website. This handoff update does not edit or verify the current portfolio download target.
2. If Alex requests further acceptance work, check native installation and popup behavior first, then a permitted signed-in Facebook session. Record actual browser versions and observed results separately from synthetic tests. Do not collect private feed content or publish account data.
3. Keep the released artifacts immutable. Any further runtime or package changes require a distinct reviewed version rather than replacing v1.0.2 or v1.0.3.
4. For a future package, review `scripts/package-release.py`'s explicit allow-list. This handoff is not currently on that list; add it deliberately only when preparing a new authorized release. From a clean checkout, `npm run package` creates the ZIP and receipts from committed blobs, excluding installed dependencies and local files.
5. Run focused checks when code or packaging inputs change. This documentation-only restart task did not repeat installs, tests, builds, or packaging and started no servers or monitors. No heavy work was needed, so no RAM/CPU snapshot was taken.

Continue in this exact product checkout. Preserve history, repository visibility, existing releases, and license status. Keep secrets, account data, raw runtime configuration, and unrelated project files out of commits and handoffs.

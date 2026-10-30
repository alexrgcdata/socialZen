const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { JSDOM } = require('jsdom');
const script = readFileSync(require.resolve('../content.js'), 'utf8');
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
function fixture(words = ['election'], overrides = []) {
  const dom = new JSDOM('<!doctype html><body></body>', { runScripts: 'outside-only', pretendToBeVisual: true });
  const w = dom.window;
  let changed;
  w.chrome = { runtime: { getURL: p => 'https://example.test/' + p }, storage: {
    local: { get: (defaults, cb) => cb(defaults) }, onChanged: { addListener: cb => { changed = cb; } }
  }};
  w.BLOCK_KEYWORDS = words; w.OVERRIDE_KEYWORDS = overrides;
  const timeout = w.setTimeout.bind(w);
  w.setTimeout = (cb, ms) => timeout(cb, ms === 4000 ? 650 : ms);
  const post = text => {
    const node = w.document.createElement('article');
    node.setAttribute('role', 'article'); node.textContent = text; w.document.body.append(node); return node;
  };
  return { w, post, start: () => w.eval(script), disable: () => changed({ facebookZenEnabled: { newValue: false } }, 'local'), close: () => w.close() };
}
test('case, whitespace, apostrophes and override priority', () => {
  const f = fixture(['election', "don't want"], ['community fundraiser']);
  try {
    const blocked = f.post('An ELECTION discussion with enough sample text.');
    const apostrophe = f.post('I DON’T   WANT this subject in the sample feed.');
    const allowed = f.post('An election community fundraiser for our town.');
    const ordinary = f.post('A lovely day of hiking beside the lake with friends.'); f.start();
    assert.ok(blocked.classList.contains('facebookzen-filtered'));
    assert.ok(apostrophe.classList.contains('facebookzen-filtered'));
    assert.ok(!allowed.classList.contains('facebookzen-filtered'));
    assert.ok(!ordinary.classList.contains('facebookzen-filtered'));
  } finally { f.close(); }
});
test('substring matching is intentional and missing lists fail open', () => {
  const f = fixture(['vote']);
  try {
    const p = f.post('Devoted to growing a garden with my neighbors.'); f.start();
    assert.ok(p.classList.contains('facebookzen-filtered'));
  } finally { f.close(); }
  const empty = fixture();
  try {
    delete empty.w.BLOCK_KEYWORDS;
    const p = empty.post('Look at this cool election story with love.'); empty.start();
    assert.ok(!p.classList.contains('facebookzen-filtered'));
  } finally { empty.close(); }
});
test('new posts and text changes are checked; detached controls are removed', async () => {
  const f = fixture();
  try {
    const p = f.post('A quiet weekend walking through the neighborhood.'); f.start();
    p.firstChild.data = 'An election discussion has replaced this sample text.'; await pause(200);
    assert.ok(p.classList.contains('facebookzen-filtered'));
    const next = f.post('Another election discussion loaded while scrolling.'); await pause(200);
    assert.ok(next.classList.contains('facebookzen-filtered'));
    p.remove(); await pause(200);
    assert.equal(f.w.document.querySelectorAll('[data-facebookzen-controls]').length, 1);
  } finally { f.close(); }
});
test('reveal survives rescans, hides controls, then reapplies mask', async () => {
  const f = fixture();
  try {
    const p = f.post('An election discussion with enough sample content.'); f.start();
    f.w.document.querySelector('button').click();
    const controls = f.w.document.querySelector('[data-facebookzen-controls]');
    assert.equal(controls.style.getPropertyPriority('display'), 'important');
    assert.equal(controls.style.display, 'none');
    f.post('A second ordinary post triggers a new scan of the feed.'); await pause(200);
    assert.ok(p.classList.contains('facebookzen-preview')); await pause(550);
    assert.ok(p.classList.contains('facebookzen-filtered')); assert.equal(controls.style.display, 'flex');
  } finally { f.close(); }
});
test('disabling during a reveal cancels the timer and removes masking', async () => {
  const f = fixture();
  try {
    const p = f.post('An election discussion with enough sample content.'); f.start();
    f.w.document.querySelector('button').click(); f.disable(); await pause(750);
    assert.equal(p.className, ''); assert.equal(f.w.document.querySelectorAll('[data-facebookzen-controls]').length, 0);
  } finally { f.close(); }
});

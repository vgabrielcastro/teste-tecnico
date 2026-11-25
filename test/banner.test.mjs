import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const bannerSource = await readFile(
  new URL('../banner.js', import.meta.url),
  'utf8',
);

function createGptEnvironment({ bodyAvailable = true } = {}) {
  const commands = [];
  const scriptElements = [];
  const styleElements = [];
  const mappingSizes = [];
  const refreshCalls = [];
  const timers = [];
  const displayedIds = [];
  const elementsById = new Map();
  const documentListeners = {};
  let enabledServices = false;
  let definition;
  let body = bodyAvailable ? createBody() : null;

  function createBody() {
    return {
      appendChild(element) {
        if (element.id) {
          elementsById.set(element.id, element);
        }
      },
    };
  }

  const slot = {
    defineSizeMapping(mapping) {
      this.mapping = mapping;
      return this;
    },
    addService(service) {
      this.service = service;
      return this;
    },
  };

  const pubads = {
    refresh(slots) {
      refreshCalls.push(slots);
    },
  };

  const googletag = {
    cmd: {
      push(callback) {
        commands.push(callback);
      },
    },
    sizeMapping() {
      return {
        addSize(viewport, sizes) {
          mappingSizes.push({ viewport, sizes });
          return this;
        },
        build() {
          return { mappingSizes };
        },
      };
    },
    defineSlot(adUnitPath, sizes, divId) {
      definition = { adUnitPath, sizes, divId };
      return slot;
    },
    pubads() {
      return pubads;
    },
    enableServices() {
      enabledServices = true;
    },
    display(divId) {
      displayedIds.push(divId);
    },
  };

  const window = {
    googletag,
    setInterval(callback, interval) {
      timers.push({ callback, interval });
    },
  };

  const document = {
    get body() {
      return body;
    },
    head: {
      appendChild(element) {
        if (element.tagName === 'script') {
          scriptElements.push(element);
        } else if (element.tagName === 'style') {
          styleElements.push(element);
        }
        if (element.id) {
          elementsById.set(element.id, element);
        }
      },
    },
    createElement(tagName) {
      return {
        tagName,
        dataset: {},
        setAttribute(name, value) {
          this[name] = value;
        },
      };
    },
    getElementById(id) {
      return elementsById.get(id) ?? null;
    },
    querySelector(selector) {
      return selector.includes('gpt.js') && scriptElements.length > 0
        ? scriptElements[0]
        : null;
    },
    addEventListener(name, callback) {
      documentListeners[name] = callback;
    },
  };

  function runBanner() {
    runInNewContext(bannerSource, { window, document, console });
  }

  return {
    commands,
    definition: () => definition,
    displayedIds,
    documentListeners,
    enableBody() {
      body = createBody();
    },
    enabledServices: () => enabledServices,
    mappingSizes,
    refreshCalls,
    runBanner,
    scriptElements,
    slot,
    styleElements,
    timers,
  };
}

test('creates a responsive banner, displays it and refreshes only its slot', () => {
  const environment = createGptEnvironment();

  environment.runBanner();

  assert.equal(environment.scriptElements.length, 1);
  assert.equal(environment.scriptElements[0].async, true);
  assert.equal(
    environment.scriptElements[0].src,
    'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
  );
  assert.equal(environment.styleElements.length, 1);
  assert.match(environment.styleElements[0].textContent, /position: fixed/);
  assert.match(environment.styleElements[0].textContent, /width: 728px/);
  assert.match(environment.styleElements[0].textContent, /height: 90px/);
  assert.match(environment.styleElements[0].textContent, /max-width: 767px/);
  assert.match(environment.styleElements[0].textContent, /right: 20px/);
  assert.match(environment.styleElements[0].textContent, /width: 300px/);
  assert.match(environment.styleElements[0].textContent, /height: 250px/);
  assert.equal(environment.commands.length, 1);

  environment.commands.shift()();

  assert.deepEqual(
    JSON.parse(JSON.stringify(environment.definition())),
    {
      adUnitPath: '/8804/teste/qa1',
      sizes: [
        [728, 90],
        [300, 250],
      ],
      divId: 'gpt-banner',
    },
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(environment.mappingSizes)),
    [
      { viewport: [768, 0], sizes: [728, 90] },
      { viewport: [0, 0], sizes: [300, 250] },
    ],
  );
  assert.equal(environment.enabledServices(), true);
  assert.deepEqual(environment.displayedIds, ['gpt-banner']);
  assert.equal(environment.timers[0].interval, 30000);

  environment.timers[0].callback();
  assert.equal(environment.commands.length, 1);
  environment.commands.shift()();
  assert.equal(environment.refreshCalls.length, 1);
  assert.equal(environment.refreshCalls[0].length, 1);
  assert.equal(environment.refreshCalls[0][0], environment.slot);
});

test('waits for the body when the script is loaded in the document head', () => {
  const environment = createGptEnvironment({ bodyAvailable: false });

  environment.runBanner();

  assert.equal(environment.commands.length, 0);
  assert.equal(typeof environment.documentListeners.DOMContentLoaded, 'function');

  environment.enableBody();
  environment.documentListeners.DOMContentLoaded();

  assert.equal(environment.commands.length, 1);
  assert.equal(environment.styleElements.length, 1);
});

test('does not initialize the same container or load GPT more than once', () => {
  const environment = createGptEnvironment();

  environment.runBanner();
  environment.runBanner();

  assert.equal(environment.scriptElements.length, 1);
  assert.equal(environment.styleElements.length, 1);
  assert.equal(environment.commands.length, 1);
});

import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { analyticsConfigScript, googleInitScript, googlePrivacySettings } from "../lib/analytics-config";

const restrictedSettings = {
  restricted_data_processing: true,
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
};

test("Google privacy decision requires an explicit true GPC signal", () => {
  assert.deepEqual(googlePrivacySettings(true), {
    requestNonPersonalizedAds: 1,
    gtag: restrictedSettings,
  });
  for (const value of [undefined, null, false, 0, 1, "true", "false"]) {
    assert.equal(googlePrivacySettings(value), null);
  }
});

function initializeGoogle(globalPrivacyControl: unknown, id?: string) {
  const queuedAd = { slot: "existing-slot" };
  const adsbygoogle = [queuedAd] as unknown[] & { requestNonPersonalizedAds?: number };
  const window = {
    location: { href: "https://example.com/?cat=toys" },
    dataLayer: [] as IArguments[],
    adsbygoogle,
    addEventListener: () => {},
  };
  // Browser globals share the window object, so GA's gtag declaration and the
  // privacy bootstrap use the same function and queue.
  runInNewContext(googleInitScript(id), Object.assign(window, {
    window, navigator: { globalPrivacyControl }, history: {},
    document: { referrer: "" }, URL, Date,
  }));
  assert.equal(window.adsbygoogle, adsbygoogle);
  assert.equal(window.adsbygoogle[0], queuedAd);
  return window;
}

test("GPC configures AdSense and queues restrictions before GA's first config", () => {
  const window = initializeGoogle(true, "G-TEST");
  assert.equal(window.adsbygoogle.requestNonPersonalizedAds, 1);
  const commands = window.dataLayer.map(args => Array.from(args));
  assert.equal(commands[0][0], "set");
  assert.deepEqual(JSON.parse(JSON.stringify(commands[0][1])), restrictedSettings);
  assert.ok(commands.findIndex(args => args[0] === "config") > 0);
});

test("GPC applies to AdSense without a configured GA ID", () => {
  const window = initializeGoogle(true);
  assert.equal(window.adsbygoogle.requestNonPersonalizedAds, 1);
  assert.equal(window.dataLayer.length, 1);
  assert.equal(window.dataLayer[0][0], "set");
});

test("absent or false GPC leaves Google defaults unchanged", () => {
  for (const value of [undefined, false, "true", 1]) {
    for (const id of [undefined, "G-TEST"]) {
      const window = initializeGoogle(value, id);
      assert.equal(window.adsbygoogle.requestNonPersonalizedAds, undefined);
      assert.ok(!JSON.stringify(window.dataLayer).includes("restricted_data_processing"));
      assert.equal(window.dataLayer.some(args => args[0] === "config"), !!id);
    }
  }
});

test("GA URLs omit free text at initialization and before history measurement", () => {
  const location = { href: "https://example.com/?q=private%40example.com&cat=toys" };
  const window = { location, dataLayer: [] as IArguments[], addEventListener: (_: string, fn: () => void) => { popstate = fn; } };
  let popstate = () => {};
  const latest = () => Array.from(window.dataLayer.at(-1)!);
  const history = Object.fromEntries(["pushState", "replaceState"].map(method => [method, (_state: unknown, _title: string, url: string) => {
    if (window.dataLayer.length) {
      const [command, fields] = latest();
      assert.equal(command, "set");
      assert.ok(!JSON.stringify(fields).includes("private"));
    }
    location.href = new URL(url, location.href).href;
  }]));
  runInNewContext(analyticsConfigScript("G-TEST"), { window, history, document: { referrer: "https://example.com/?q=private&street=4th" }, URL, Date });
  assert.equal(location.href, "https://example.com/?cat=toys");
  const config = window.dataLayer.map(args => Array.from(args)).find(args => args[0] === "config")!;
  assert.equal(config[2].page_location, "https://example.com/?cat=toys");
  assert.equal(config[2].page_referrer, "https://example.com/?street=4th");
  history.replaceState(null, "", "/es?q=private&cat=party&street=4th");
  assert.equal(latest()[1].page_location, "https://example.com/es?cat=party&street=4th");
  history.pushState(null, "", "/?q=private&cat=toys");
  location.href = "https://example.com/?q=private&street=3rd";
  popstate();
  assert.equal(latest()[1].page_location, "https://example.com/?street=3rd");
  assert.ok(!JSON.stringify(window.dataLayer).includes("private"));
});

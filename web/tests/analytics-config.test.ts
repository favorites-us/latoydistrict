import test from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import { analyticsConfigScript } from "../lib/analytics-config";

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

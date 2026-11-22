import test from "node:test";
import assert from "node:assert/strict";
import { langForPath, htmlLangScript } from "../lib/html-lang";

test("langForPath marks only the /es tree as Spanish", () => {
  assert.equal(langForPath("/"), "en");
  assert.equal(langForPath("/es"), "es");
  assert.equal(langForPath("/es/stores/toy-time-la-255"), "es");
  assert.equal(langForPath("/estate"), "en");
  assert.equal(langForPath("/stores/es"), "en");
});

test("inline script applies the same rule", () => {
  const run = (pathname: string) => {
    const document = { documentElement: { lang: "en" } };
    new Function("location", "document", htmlLangScript)({ pathname }, document);
    return document.documentElement.lang;
  };
  assert.equal(run("/es"), "es");
  assert.equal(run("/es/guide/visiting"), "es");
  assert.equal(run("/estate"), "en");
  assert.equal(run("/"), "en");
});

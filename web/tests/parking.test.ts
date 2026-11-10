import test from "node:test";
import assert from "node:assert/strict";
import { nearestLots, parkingLots, parkingCheckedAt, parkingPrice, lotRatesUrl } from "../lib/parking";
import { visiting } from "../lib/content/guides";

test("nearby parking uses distance before rounded walking time and rejects invalid locations", () => {
  // These two entrances round to the same walking minute; the closer one must win.
  const lots = nearestLots(34.047675, -118.247525);
  assert.equal(lots[0].id, "main-416");
  assert.equal(lots[1].id, "main-415");
  assert.equal(lots[0].walk_min, lots[1].walk_min);
  for (const [lat, lng] of [[NaN, 0], [0, Infinity], [91, 0], [0, -181]]) {
    assert.deepEqual(nearestLots(lat, lng), []);
  }
});

test("parking reference prices omit missing and invalid rates, and rate links use each lot's location", () => {
  const lot = parkingLots[0];
  assert.equal(parkingPrice({ ...lot, sat_day_from_usd: 10.99 }), "~$11");
  for (const value of [undefined, NaN, Infinity, -1]) {
    assert.equal(parkingPrice({ ...lot, sat_day_from_usd: value }), null);
  }
  for (const item of parkingLots) {
    const url = new URL(lotRatesUrl(item));
    assert.equal(url.hostname, "spothero.com");
    assert.equal(Number(url.searchParams.get("latitude")), item.lat);
    assert.equal(Number(url.searchParams.get("longitude")), item.lng);
  }
});

test("both visiting guides keep parking dates and FAQ reference prices aligned with the lot data", () => {
  const rates = parkingLots.flatMap(lot => lot.sat_day_from_usd == null ? [] : [lot.sat_day_from_usd]);
  const range = `$${Math.round(Math.min(...rates))}–${Math.round(Math.max(...rates))}`;
  for (const guide of [visiting.en, visiting.es]) {
    assert.equal(guide.reviewed_at, parkingCheckedAt);
    assert.ok(guide.faq?.some(item => item.a.includes(range)));
    assert.equal(guide.sections.filter(section => section.widget === "parking").length, 1);
  }
});

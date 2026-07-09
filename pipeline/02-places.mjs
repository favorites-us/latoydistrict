// Source 2 (reconciliation only): Google Places API.
// Per Google Maps Platform ToS we do NOT store or display Places content.
// We keep only place_id + open/closed signal + coordinates for cross-checking.
// Skips gracefully when GOOGLE_MAPS_API_KEY is not set.
import { writeOut, BBOX } from "./lib.mjs";

const KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!KEY) {
  console.log("GOOGLE_MAPS_API_KEY not set — skipping Places reconciliation (ok for v0).");
  writeOut("places.json", []);
  process.exit(0);
}

const results = [];
const queries = ["toy wholesale", "toys", "party supplies wholesale", "gift wholesale"];
for (const q of queries) {
  let pageToken = null;
  do {
    const body = {
      textQuery: `${q} toy district los angeles`,
      locationRestriction: {
        rectangle: {
          low: { latitude: BBOX.latMin, longitude: BBOX.lngMin },
          high: { latitude: BBOX.latMax, longitude: BBOX.lngMax },
        },
      },
      pageSize: 20,
      ...(pageToken ? { pageToken } : {}),
    };
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": KEY,
        // minimal field mask = lowest SKU; no display fields are requested
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.businessStatus,nextPageToken",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Places ${res.status}: ${await res.text()}`);
    const data = await res.json();
    for (const p of data.places || []) {
      results.push({
        place_id: p.id,
        // name/address kept transiently for matching in step 03; never written to data/
        match_name: p.displayName?.text || "",
        match_address: p.formattedAddress || "",
        coords: p.location ? { lat: p.location.latitude, lng: p.location.longitude } : null,
        business_status: p.businessStatus || null,
      });
    }
    pageToken = data.nextPageToken || null;
  } while (pageToken);
}

// dedupe by place_id
const seen = new Set();
writeOut(
  "places.json",
  results.filter((p) => (seen.has(p.place_id) ? false : (seen.add(p.place_id), true))),
);

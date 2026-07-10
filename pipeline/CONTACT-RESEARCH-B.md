# Contact research brief B (Yelp / public-directory PHONE numbers)

Goal: for each store in the assigned input file, find a **phone number** from a
public business listing (Yelp preferred) and record it, plus the Yelp listing
URL as a link. Write results to the assigned output file, then
`node pipeline/07-contact.mjs` merges them (fills blanks only).

This is a deliberate widening of the earlier Option A pass to also accept Yelp
and similar public directories **for the phone number only**.

## Hard rules (do not break)

1. **NEVER use Google Maps / Google Places / Google Business Profile** as a
   source for anything. That specific source is off-limits (ToS). Yelp and other
   public business directories ARE allowed here.
2. **Phone number only.** Do NOT copy opening `hours` from Yelp or directories —
   Yelp hours are often user-reported and stale. Leave `hours` null unless it's
   on the business's own website. (If you happen to open the business's own site
   and hours are clearly published there, you may include them — otherwise null.)
3. **High precision.** Only accept a phone if the listing clearly matches *this*
   business at *this* address: the name matches AND the address / cross-street is
   in Downtown LA (ZIP 90013, the Toy District blocks: Wall, Winston, Boyd, 3rd,
   4th, 5th, Los Angeles St, San Pedro St, Werdin). If a Yelp page shows a
   different address or a same-name business elsewhere, treat it as no match.
4. Never invent a number. Every non-null `phone` must have `provenance` set to
   the exact listing URL you read it from.
5. Only `http(s)` URLs. Record the Yelp listing URL in `links.yelp`.

## For each store

Search e.g. `"Casa Manga" Wall St Los Angeles yelp` or the name + address. Open
the Yelp listing (or another public directory). Confirm name + Toy District /
90013 address. If it matches, take the phone number and the listing URL.

Most of these are small wholesalers; many will still have no findable listing —
that's expected. Return `found: false` with nulls for those. Do not force it.

## Output — write to the assigned output file

```json
{
  "generated_note": "phone from Yelp/public directories; never Google Places; hours not taken from Yelp",
  "results": [
    {
      "id": "casa-manga-321",
      "found": true,
      "confidence": "high",
      "phone": "(213) 555-1234",
      "hours": null,
      "links": { "website": null, "facebook": null, "instagram": null, "whatsapp": null, "yelp": "https://www.yelp.com/biz/...", "other": [] },
      "provenance": "https://www.yelp.com/biz/...",
      "notes": "phone from Yelp listing; name + 90013 address confirmed"
    }
  ]
}
```

- One object per input store, same `id`. No match → `found:false`, `phone:null`,
  null links, `provenance:null`.
- `confidence`: high = name + Toy District address both confirmed on the listing;
  medium = name matches, address partially shown; low = unsure (prefer null).

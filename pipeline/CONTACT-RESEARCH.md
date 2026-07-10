# Contact research brief (Option A — business's own web presence only)

Goal: for each store in `pipeline/out/contacts-input.json`, find the business's
**own** web presence and its published contact info, and write the results to
`pipeline/out/contacts.json`. Then `node pipeline/07-contact.mjs` merges them
into `data/stores.json` (conservatively — it only fills blanks).

## Hard rules (legal — do not break)

1. **Only the business's OWN pages** may be the source of `phone` and `hours`:
   the official website, or the business's own Facebook / Instagram page.
   Do **NOT** copy phone or hours from Google Maps/Places, Yelp, or any other
   aggregator/directory. (Storing Google Places content violates its ToS and
   risks the whole project — this constraint is the reason for Option A.)
2. A Yelp listing URL, or another directory page, MAY be recorded as a *link*
   (in `links.yelp` / `links.other`) — but never as the source of phone/hours.
3. **High precision over recall.** If you are not confident the page is *this*
   business at *this* address (name match + Downtown LA / ZIP 90013 area),
   leave the field null. A wrong phone number is worse than a blank one.
4. Never invent a value. Every non-null `phone`/`hours` must have `provenance`
   set to the exact URL of the business's own page you read it from.
5. Only `http(s)` URLs. Normalize phones as written on the source page.

## For each store

Search the web for the business name + street address (e.g.
`"Abc Toys Wholesale" 323 E 4th St Los Angeles`). Look for:
- an official website (its own domain — not a marketplace subpage),
- a Facebook business page, an Instagram profile,
- optionally the Yelp listing URL (as a link only).

Then, from the business's own site/FB/IG only, read `phone` and `hours` if
clearly published. Most of these are tiny wholesalers with no web presence —
that is expected; return `found: false` with all nulls for them. Do not force
a match.

## Output — `pipeline/out/contacts.json`

```json
{
  "generated_note": "business's own web presence only; phone/hours never from aggregators",
  "results": [
    {
      "id": "abc-toys-wholesale-323",
      "found": true,
      "confidence": "high",
      "phone": "(213) 555-1234",
      "hours": "Mon–Sat 9am–5pm, closed Sun",
      "links": {
        "website": "https://example.com",
        "facebook": "https://www.facebook.com/...",
        "instagram": "https://www.instagram.com/...",
        "whatsapp": null,
        "yelp": "https://www.yelp.com/biz/...",
        "other": []
      },
      "provenance": "https://example.com/contact",
      "notes": "phone+hours from official site contact page"
    }
  ]
}
```

- Include one object per input store, same `id`. Unmatched stores: `found:false`,
  `phone:null`, `hours:null`, empty/null links, `provenance:null`.
- `confidence`: high = name+address both confirm on the page; medium = strong
  name match, address not shown; low = plausible but unconfirmed (prefer null).

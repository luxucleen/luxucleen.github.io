---
name: "places_search"
title: "Places Search"
description: "Find, compare, and share details on physical places near the user or in a specified area, including restaurants, cafes, bars, hotels, parks, attractions, shops, and businesses with local services. Not for itineraries, choosing a city or region, dated events or showtimes, or directions."
metadata: { "includeInPrompt": false }
---

# Places

> **LUXOR-IMPROVED · 2026-09-21** — this file covers list number 101 as one unit. Added: "Christian's setup" (his real operating context) and the travel-booking family conventions pointer. Every original line, command, flow, and rule is kept intact — zero lines removed, only additions.


Run `local-search` and `places <command>` through `exec`. They are your only
places tools. Never load or search for a `places` tool namespace. If a search
comes back empty or weak, refine the query per the Rules below rather than
looking for another tool. Print JSON to stdout for you to read, not to show
the user. Use `--help` when needed. No sign-in is required.

## Common flows

### Find places

Use `local-search` for standing places people can visit or reference on a map: restaurants, cafes,
bars, hotels, parks, trails, attractions, shops, and local services. A follow-up
like "anything cheaper?" or "Italian instead?" refines the preceding search.

- Make the first `--query` the broad, intent-aligned anchor. Add complementary
  queries only when they explore a different facet, such as a subtype or a
  specific venue name. Do not send paraphrases. The CLI accepts at most six
  distinct queries.
- Put area in `--location`, never the query, at the granularity the request
  implies: omit it for "near me" or no stated area so device location is used,
  an address when known, a neighborhood for a local ask, the city only when the
  ask is citywide. Use `--radius` when the user requests or implies a distance
  bound or when "near me" refers to a dense place (e.g., Manhattan, or other
  densely populated places).
- One call covers one area. When the user names multiple cities or
  neighborhoods, run a separate call for each and cover each in the answer.
- Use `--search-type discovery` for category or set searches. Use `known_place`
  only when the whole request concerns one or a few named businesses or
  landmarks.
- For "best," trending, insider, or nuanced requests, run a web search first
  and feed useful venue names into `local-search` as `known_place` queries.
  Skip that step for plain, well-scoped requests.
- Order the places you name by `avg_rating` from `places details`, highest
  first. Web mentions surface candidates; ratings order them. Rank by the
  rating, never print it.
- Avoid showing permanently or temporarily closed places unless specifically
  asked for.
- Judge the merged result set rather than following rank. Set aside
  wrong-category or wrong-area results. If the set is weak, retry with a bare
  venue name, a narrower subtype, or a better area.

### Get richer details

- `places details` takes numeric place IDs only. It cannot search by name or
  address; use `local-search` for that.
- Numeric place IDs returned by web search are valid inputs to `places details`,
  just like IDs returned by `local-search`.
- Prefer the local-search response when it already contains enough detail. Use
  `places details` for richer or fresher hours, prices, photos, reviews, and
  offerings.
- Batch several IDs into one call when comparing places. Pass `--motivation`
  with the user's intent so quotes and photos are ranked for it.
- `local-search` output saved to a tool-output file wraps stdout as a JSON
  string: read it with `jq -r '.stdout' FILE | jq …`.
- `places details` returns `{"<place_id>": {"details": {…, "rating":
  {"avg_rating", "num_rating"}}}}`, keyed by id.

### Show places on a map

When the final answer presents one or more place results, create one map if at
least one has both a numeric place ID and coordinates. This applies to
recommendations, comparisons, named-place lookups, and other uses where a map
could ground the user on your results. See Response formatting for which places
go on it.

Create one `local_map` widget with this payload:

```json
{
  "kind": "local_map",
  "data": {
    "elements": [
      {
        "kind": "rich_place",
        "place_id": "<numeric ID>",
        "name": "<name from the same result>",
        "coordinate": {
          "latitude": 0.0,
          "longitude": 0.0
        }
      }
    ]
  }
}
```

- Replace the example coordinates with the returned numeric values. Copy the
  ID, name, and coordinates from the same result record. Never geocode a name
  to fill in a missing coordinate.
- If creation fails, answer in text. Do not retry or build an HTML or image map.

### Identify a place from a photo

Use `places detect` when captured frames and GPS need to resolve which place the
user is at. It returns ranked candidates as `{place_id, place_name, confidence}`.
Pass a returned ID to `places details` for more. The optional 4th `--location`
field is the connected Wi-Fi BSSID; include it verbatim when known to improve
Home/Work matching, and never echo a raw BSSID back to the user.

## Response formatting

- Never name a place that did not come back from a tool.
- Match the framing to the ask. When the user wants a recommendation, give them
  two to three. When the request is broad, offer a few named results as a
  starting point.
- Name two to three places in text from the merged result set. Write each on
  its own line in exactly this shape: `**Name**, a sentence or two on why you
  chose it.` Open with one short line framing the answer before the places.
- Send the text as one message. Never add a second message after the map.
- No addresses, raw place IDs, coordinates, star ratings, review counts, or
  price levels in text.
- After a recommendation, note there are more options without itemizing; after
  a broad answer, offer to narrow to a recommendation.
- Resolve every name you plan to use, closing line included, through
  `local-search` before creating the map. Never name an unresolved place.
- Build the map from the most relevant places returned that have a place ID
  and coordinates. Don't rely solely on named places in your text as an
  indication of what places should appear on the map.
- The places you named come first on the map, in the order you named them,
  ahead of everything else.
- Create one map per answer. Include the returned `embed_token`.
- Never narrate or reference the map. No "I mapped things out for you"; "Take a look at the map", etc.

## Limits

- Do not write directions, turn-by-turn steps, maps links, or navigation
  controls.
- Do not estimate travel times or distances. Use only values returned by a tool.

## Christian's setup

- Home base: Richmond, VA area. When the request is "near me" and device location is available, omit `--location` so it is used (this file's own rule); when device location is not available, anchor the search to Richmond, VA rather than guessing.
- Timezone: America/New_York. For place hours, a date/time without an offset is place-local civil time — do not guess a timezone or convert it.

Family conventions shared with the other travel/booking skills; the full block lives in booking.md. See booking.md § "Booking-family conventions".
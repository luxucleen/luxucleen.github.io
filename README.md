# luxucleen.com

The website of **Luxucleen LLC**, a Virginia limited liability company in the Richmond metro area
(SCC Entity ID 11952713): real estate, trading tools, software, local services, a store, an
affiliate program, the communities, and a free education section.

Live: https://luxucleen.com/ (English) and https://luxucleen.com/es/ (Spanish)

## How it is built

Static HTML and one stylesheet. No build step, no framework, no dependencies.

- No forms, no cookies, no analytics, no tracking, no web fonts, no third-party requests.
- The only JavaScript on the whole site is the small inline chat script on `/ask/` and `/es/ask/`,
  plus `application/ld+json` structured data.
- English at the root, a Spanish mirror under `/es/`.
- `knowledge.md` is the plain-text digest of every page, and is what the assistant on `/ask/`
  answers from.

## A note for anyone editing the CSS

`.wrap` carries the 22px side padding. Any element that **also** carries `.wrap` — the header bar,
`main`, the footer — may only set `padding-top` and `padding-bottom`. A `padding` shorthand on one
of those overrides the side padding and puts the text flush against the edge of a phone screen.
That bug was live on this site once.

## Licence

Content and design © 2026 Luxucleen LLC.

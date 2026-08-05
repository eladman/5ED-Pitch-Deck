# 5ED

## Register

**Brand.** Three static pages, all of them persuasion surfaces: a public landing page at `/`, the internal investor deck at `/inhouse`, a short partner deck at `/amir`. Design is the product here; there is no app UI in this repo.

## What it is

5ED builds an AI coach for individual athletes, plus a management platform for the organization behind them. The AI merges three inputs into one personal plan: the organization's training method, the physical-mental values of the חמש אצבעות methodology, and the athlete's own level, preferences and goals. Live today in a pilot with חמש אצבעות.

## Who it's for

Each surface has a different reader, and that is the main thing to get right:

- **`/` (public)** — outside mentors, advisors and stakeholders, reading alone before a meeting. Nobody is narrating. Every section has to explain itself.
- **`/inhouse`** — investors and partners, in the room, with Elad presenting. Slides can be sparse because he supplies the connective tissue.
- **`/amir`** — a single named partner conversation.

End users of the product itself are youth athletes (12-17) in organized sport, their coaches, and the organizations that run them: clubs, non-profits, national squads.

## Voice

Hebrew, RTL, direct and human. Short declarative statements over paragraphs. One idea per section, and one visual that *is* the idea rather than decoration. Highlight one or two words per headline in orange, never a whole clause.

Elad's own deck copy uses the em dash heavily as a Hebrew rhetorical beat. That is his voice and it stays. Copy written for the landing page should not import that tic, and should avoid the constructions that read as machine-written: "not because X, but because Y", tricolons, and aphoristic closers that summarize the paragraph above them.

## Anti-references

- Generic SaaS landing pages. Feature-icon grids, hero metric templates, pastel gradient blobs.
- Any English-first or LTR-first layout. This is a Hebrew product for an Israeli market.
- Anything that reads as machine-written. Elad has rejected drafts specifically for this.

## Constraints

- **Confidential material never reaches `/`**: unit economics (₪ pricing, cost per user, gross margin), named prospects that have not closed, the downside/soft-landing scenario, and the salary and company-formation arrangement with חמש אצבעות. Verify with a grep on the built file after every change.
- The company is **5ED** in public. Not "חמש טכנולוגיה", not "Five Tech". **חמש אצבעות** may be named as design partner, pilot organization and methodology owner.
- `/inhouse` and `/amir` carry `noindex` and are never linked from `/`.

## Design principles

1. **The deck is the design system.** The landing page loads `css/styles.css` and reuses the deck's real components and section ids. When a landing page needs something new, copy a deck component before inventing one.
2. **Vary the composition.** Adjacent sections must not share a layout. Rotate: full-bleed image, centered statement, radial diagram, horizontal flow, phone mockups, comparison bars, funnel.
3. **Never emoji as icons.** Inline stroke SVG, Lucide-shaped.
4. **Dark, orange accent, Heebo.** `--ink #0A0D13`, `--orange #EF7D00`, `--orange-hot #FF9A2E`. Committed on the colour-strategy axis: one saturated colour carries the identity, everything else is a tinted neutral.

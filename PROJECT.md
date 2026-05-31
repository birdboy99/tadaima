# Tadaima — project brief

A mobile-first **consulting checklist app** that helps foreign residents settle into life in Japan,
with **region-specific** guidance. UI language is **English**. Stack: **React + Vite** (JavaScript).

## Core idea

Existing apps (e.g. 5374.jp for garbage) only solve a single task. The value here is the
**integrated, ordered, region-aware** view of everything a newcomer must do — framed as consulting,
not a flat checklist. The differentiators:

1. **3 stages** of the relocation journey
2. **Region branching** — pick your ward/city, and task details (which office, etc.) change
3. **Hidden pain-points** surfaced as "gotcha" warnings (things newcomers don't know to ask)
4. **Community tips** layered on top to keep info fresh (user-generated content)

## The 3 stages

- `predeparture` — done back home; region-independent. "Things you can't undo once in Japan."
- `first2weeks` — deadlines & lead-times; region branching starts. The heart of the app.
- `after2weeks` — quality-of-life and hidden obligations; rich region branching.

## Two view modes on the home screen

- **By urgency (Timeline)** — default. Groups items by `timeTag` (day1 / week1 / within14days / later).
  Items with a legal deadline get a red accent + "deadline" badge.
- **By category** — groups items by `category` (government, insurance, banking, telecom, utilities,
  housing, garbage, transportation, health, safety, community, student-work, daily-life).

## Key insights to highlight (interview talking points)

1. 14-day move-in notification deadline (転入届) — miss 90 days → residence status can be voided
2. Bank ↔ phone chicken-and-egg (each asks for the other)
3. My Number timing gap (card arrives weeks after registration)
4. Gas requires an in-person appointment; internet has a multi-week lead time
5. Hidden gems: bicycle anti-theft registration (mandatory), NHK fee, move-in damage photos,
   student part-time work permit (資格外活動許可), medication import certificate (輸入確認書)

## Data model (src/data/data.json)

### regions[]
`id`, `name`, `officeType` (e.g. "ward office (区役所)" vs "city hall (市役所)"), `officeName`.
Demo regions: **Shibuya** (ward) and **Hachioji** (city) — chosen so the 区役所/市役所 split
becomes the region-branching logic.

### items[]
- `id`, `stage`, `category`, `timeTag`, `deadline` (bool)
- `title_en`, `title_jp`, `summary`
- `bring[]` — what to bring
- `gotcha` — the hidden pain-point / warning
- `regionScoped` (bool), `byRegion` — map keyed by region id, each `{ office, note }`
  - region-independent items have `regionScoped: false` and `byRegion: {}`

### tips[]
- `id`, `scope` ("item" | "global"), `itemId` (if item-scoped), `region` (null if general)
- `tags[]`, `body`, `author`, `date`

## Screen flow (already built / planned)

1. **Region select** — pick region, Continue button → home. (built)
2. **Home** — stage tabs (Before arrival / First 2 weeks / After 2 weeks) + item cards;
   checkbox toggles done; deadline items get red accent; region-scoped items show the
   selected region's office. (built)
3. **Item detail** — tap a card body → detail screen with title, summary, bring list,
   gotcha warning box, region office info, + a "Tips from others" section. (next)
4. **Tips feed** — separate tab; global living tips with tag filters. (planned)


## Notes for whoever builds next

- Region-specific values in `byRegion` (office names, garbage rules) are placeholders — verify

  against official Shibuya / Hachioji sources before final demo.
- Common fields are based on real research and can be used as-is.
- Deploy target: Vercel. README in English: problem → who it's for → key features →
  tech choices → one-line scaling plan.

  <img width="423" height="481" alt="image" src="https://github.com/user-attachments/assets/6b68c684-0156-4480-ae48-b3b05e8c3d53" />


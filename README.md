# Tadaima — Your first weeks in Japan, sorted.

A mobile-first **relocation checklist app** for foreign residents settling into life in Japan.  
Built as a portfolio piece for new-grad engineering applications in Japan.

**[→ Live demo](https://tadaima.vercel.app)**

---

## The problem

Moving to Japan as a foreigner means navigating a maze of bureaucratic deadlines, regional rules, and hidden gotchas — scattered across government websites, reddit threads, and word of mouth. Miss the 14-day move-in notification window and your residence status can be voided. Each ward and city has its own garbage rules, office names, and procedures.

Existing apps (e.g. 5374.jp) only solve one task at a time. There was no single, ordered, region-aware guide for everything a newcomer needs to do.

---

## Who it's for

Foreign residents arriving in Japan for the first time — students, engineers, exchange workers — who need a clear, trustworthy guide through their first weeks.

---

## Key features

| Feature | Details |
|---|---|
| **3-stage journey** | Before arrival → First 2 weeks → After 2 weeks |
| **Region branching** | Select your ward/city from all 47 prefectures — office names and rules update automatically |
| **📍 Location detection** | Reverse-geocodes your GPS position via Nominatim to suggest the nearest region |
| **Timeline & Category views** | Toggle between urgency-grouped and category-grouped views |
| **Gotcha warnings** | Surfaces hidden pain-points newcomers don't know to ask about |
| **Community tips** | Seed tips + locally-added tips with tag filters |
| **Item detail** | Per-task: what to bring, watch-out warning, your specific office, and community tips |
| **Dark UI** | MyDrugs-inspired dark theme with gradient accents |

### Key insights surfaced

1. **14-day deadline** — 転入届 must be filed within 14 days; miss 90 days → residence status voided
2. **Bank × Phone chicken-and-egg** — each institution asks for the other
3. **My Number timing gap** — card arrives weeks after registration
4. **Gas needs in-person appointment** — internet has multi-week lead time
5. **Hidden obligations** — bicycle anti-theft registration (mandatory), NHK fee, part-time work permit for students

---

## Tech

- **React 19 + Vite** — SPA, no framework overhead
- **Inline styles** — zero CSS-in-JS dependency, portable
- **JSON data model** — regions / items / tips; region-specific data keyed by region ID
- **Nominatim OSM API** — free reverse-geocoding, no API key required

---

## Architecture

```
src/
├── App.jsx          # Single-component app (screens: region → home → detail)
└── data/
    └── data.json    # regions[], items[], tips[]
```

All 47 Japanese prefectures are represented with major cities. Region-specific office data is seeded for Shibuya and Hachioji as demo targets — the structure is ready for any region to be filled in.

---

## Scaling plan

Replace `data.json` with a Postgres DB + REST API; add auth so users can save progress and submit tips that persist across sessions.

---

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Deploy

Configured for **Vercel** — connect the repo and deploy with zero config.

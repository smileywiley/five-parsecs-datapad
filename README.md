# Five Parsecs From Home — Campaign Datapad

**[Launch Live App](https://smileywiley.github.io/five-parsecs-datapad/)**

A client-side web application for tracking **Five Parsecs From Home** tabletop campaigns with a **Solo Game Master's Guide**–inspired structured narrative journal. Designed for table-side use with a dark/light datapad UI, instant `localStorage` persistence, and zero backend setup.

## Features

- **Multi-Campaign Support**: Create, switch, or delete campaigns, or explore immediately with a 1-click **Sample Campaign**.
- **Campaign Dashboard**: Track current planet & traits, invasion threats, active quests, and an interactive 4-step turn phase checklist (*Travel → World Steps → Battle → Post-Battle*) with automatic Sickbay recovery tick-down on turn advance.
- **Crew Roster**: Full 5PFH stats (Reactions, Speed, Combat, Toughness, Savvy, Luck, XP), Leader/Bot/Soulless flags, Sickbay recovery countdown, injuries, custom tags, and character notes.
- **Ship & Debt**: Hull integrity bar, ship traits, installed upgrades, and debt payment tracking (with optional Credit deduction).
- **Stash & Cargo**: Categorized inventory (Weapons, Armor, Gear, Consumables, Ship Parts, Trade Goods) with 1-click **Equip to Crew** and **Unequip to Stash**.
- **Patrons & Rivals**: Track status, persistence, benefits, threat types, and linked journal notes.
- **Mission Log**: Chronological battle & turn records with outcomes, credits, loot, casualties, Markdown battle reports, and cross-linked Turn # journal notes.
- **Structured Solo Journal**: Markdown notes categorized into `Threads`, `Locations`, `NPCs`, `Lore`, and `Session Notes` with pinning, tags, search, Split/Edit/Preview modes, quick-insert Solo GM templates (*Scene Prompt*, *Story Thread*, *Location*, *NPC Profile*), and Turn/Planet/Patron/Rival cross-linking.
- **Backup & Export**: Auto-saves to browser `localStorage`, plus 1-click **JSON Export/Import** and **Markdown Journal Export (`.md`)**.

## Tech Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + `lucide-react`
- `marked` for Markdown rendering
- Vitest for unit tests

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173/` in your browser.

## Scripts

- `npm run dev` — Start the Vite development server
- `npm test` — Run unit tests with Vitest
- `npm run build` — Typecheck and build for production
- `npm run preview` — Preview the production build locally

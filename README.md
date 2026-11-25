Subtext — pass-and-play social deduction word game (PWA)
========================================================

Subtext is an original, ad‑free, offline‑capable web app inspired by the mechanics of “Undercover™: Word Party Game”. It supports 3–20 players on a single phone, with pass‑and‑play word reveals, voting, Mr. White guesses, and a session leaderboard.

What’s included
- Offline‑ready PWA (manifest + service worker), Add to Home Screen.
- Mobile‑first UI with safe‑area insets, dark mode, haptic taps, optional sounds (off by default).
- Full rules: Civilians, Undercover, Mr. White; random speaking order; tie‑break options; Mr. White immediate‑win guess; win and scoring (Civilians +2, Mr. White +6, Undercover +10).
- Local persistence: players, leaderboard, custom word pairs.
- Unit tests for the game engine (role assignment, word pick, Mr. White match, victory, scoring).

Local development
1) Install deps: `npm install`
2) Start dev server (binds to port 43123): `npm run dev`
3) Open http://localhost:43123

Build & preview production
1) `npm run build`
2) `npm run start` (defaults to port 3000)

Run tests
`npm test`

Deploy (Vercel)
- Push this repo, then import it into Vercel and deploy with defaults.
- No environment variables required.
- PWA works offline after the first load; iOS users should “Add to Home Screen” for the best pass‑and‑play experience.

Notes on rules parity
- Players: 3–20. At least one infiltrator (Undercover or Mr. White).
- Random speaking order each round (Mr. White can start).
- Voting ties: choose “Face‑off & Revote”, “Goddess of Justice” (random), or “Manual” (e.g., rock‑paper‑scissors).
- Mr. White: eliminated Mr. White may guess the Civilians’ word; a forgiving matcher (case, accents, whitespace, simple plurals, small typos) applies. Group can also manually accept.
- Victory: Civilians win when all infiltrators are eliminated. Infiltrators win if only one Civilian remains. Mr. White also wins if their guess is accepted.
- Scoring on victory only: Civilians +2 each, Mr. White +6, Undercover +10.

Design & assets
- Original name, UI, icons, and sounds. No copied art, text, or word lists.
- Fonts self‑hosted via `next/font` (Barlow Semi Condensed + Spectral).

Privacy
- 100% client‑side. No analytics, no tracking, no network access after load.

License
- Source code © 2026. Word pairs list is original to this project.


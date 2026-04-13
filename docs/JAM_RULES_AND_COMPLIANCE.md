# Jam Rules and Compliance

---

## Gamedev.js Jam 2026 — Relevant Rules Summary

> Note: This document summarizes rules as understood at the time of writing. Always verify against the official jam page before submission.

### Core Requirements

| Rule | Requirement |
|---|---|
| **Platform** | Game must run in a web browser. No native executables, no required plugins. |
| **JavaScript** | Game must use JavaScript (or a JS-compiled language / framework). |
| **Theme** | Game must be based on the jam theme: **"Machines"** |
| **New content** | Game must be created during the jam period. Resubmitting old projects is not allowed. |
| **Team size** | Solo or team entries are allowed. |
| **Language** | Game must be playable in English (default language). |

### AI and Copyright

| Rule | Requirement |
|---|---|
| **AI use** | AI tools are allowed for development, art, and audio generation. |
| **Copyright** | All assets (art, audio, fonts, libraries) must be original, AI-generated with appropriate rights, or under a license permitting game jam use (CC0, CC-BY, MIT, etc.). |
| **No IP violations** | Do not use copyrighted characters, music, trademarks, or assets without permission. |

---

## How Steamheart Fits the Requirements

### Browser Requirement
- Built with Phaser 3 — a JavaScript framework
- Output is a static HTML/JS bundle
- Runs in any modern browser without plugins
- **Status: Compliant by design**

### JavaScript Requirement
- Phaser 3 is a JavaScript framework
- Game logic written in JavaScript (or TypeScript compiled to JS)
- **Status: Compliant**

### Theme Compliance
- The game is fundamentally about building and operating machines
- Machines are not a backdrop — they are the central mechanic, the win condition, and the visual identity
- Every level presents a machine to be built and activated
- **Status: Strong thematic alignment**

### New Content
- This project is started from scratch for this jam
- No recycled levels, no re-skinned old games
- Code, art, and design created during the jam window
- **Status: Compliant — document your start date in git history**

### Default Language: English
- All UI text, level names, tutorial messages, and error messages in English
- No localization layer needed — English is the only language
- **Status: Compliant**

### AI and Copyright
- AI tools may be used for sprite generation, SFX creation, and code assistance
- All AI-generated assets must be from tools whose terms permit commercial/jam use
- All third-party libraries must be open-source (MIT, Apache, BSD, etc.)
- Audio from Freesound or OpenGameArt: verify per-file license before use
- Fonts: use only OFL (Open Font License) or CC0 fonts
- **Status: Requires due diligence per asset — see checklist below**

---

## Development Do / Don't Checklist

### DO

- [x] Build the game from scratch during the jam window
- [x] Use Phaser 3 or equivalent JS framework
- [x] Ensure the game runs in Chrome and Firefox without plugins
- [x] Write all default text and UI in English
- [x] Keep the design clearly and directly related to the theme "Machines"
- [x] Document all third-party assets and their licenses in a CREDITS file
- [x] Verify AI-generated art/audio tool terms before using assets
- [x] Test the browser build before submission — not just local dev server
- [x] Provide a clear "How to Play" in-game or on the submission page
- [x] Submit before the deadline with a working build URL

### DON'T

- [ ] Don't submit a game built before the jam started
- [ ] Don't use assets from commercial libraries without a jam-compatible license
- [ ] Don't use copyrighted music, even as placeholder — it may be forgotten at submission
- [ ] Don't ship requiring WebGL2 or features not available on standard browsers without a fallback note
- [ ] Don't use someone else's art/code without their permission and credit
- [ ] Don't make the theme connection vague or superficial — judges look for genuine alignment
- [ ] Don't add an external download or require an account to play

---

## Credits File Requirement

Before submission, create a `CREDITS.md` (or in-game credits screen) listing:

- Game title and author
- All third-party libraries with name, version, and license
- All third-party art assets with source URL and license
- All third-party audio assets with source URL and license
- Any AI tools used (tool name, version/model if known, what it was used for)
- Any fonts used with license information

---

## Pre-Submission Compliance Checklist

Run through this before hitting Submit:

- [ ] Game loads and runs in browser (test on Chrome, test on Firefox)
- [ ] No console errors on load
- [ ] Game is playable without instructions (or instructions are in-game)
- [ ] All UI and text is in English
- [ ] Theme "Machines" is clearly expressed in gameplay
- [ ] CREDITS file / screen is present and complete
- [ ] No placeholder "temp" assets from unknown sources in the build
- [ ] Build URL is publicly accessible (not localhost)
- [ ] Submission form filled out: title, description, screenshots, tags
- [ ] At least one good screenshot attached to the submission page

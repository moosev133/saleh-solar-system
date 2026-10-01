# Saleh Solar System

A white-and-yellow, interactive solar showcase for Saleh Zedany, created as a moosetvs portfolio project.

## Review online

[Open the live website](https://saleh-solar-system.meliodasin14.chatgpt.site). The website is publicly viewable; the source repository is private.

## Open locally

Run `npm start` in this folder, then open http://localhost:4173.
On this Mac, you can also double-click `start.command`.
The server binds only to your computer and serves the `dist` folder.

No build or dependency installation is needed. Three.js and the font are bundled locally.

## Languages

Hebrew is the default. Arabic and English are available from the header selector. Language selection is saved on the device and reflected in the `lang` URL parameter for sharing. Hebrew and Arabic use RTL layout; personal and company names remain English.

Translations are in `dist/translations.js`. Shared owner/contact information is in `dist/content.json`.

## Experience

- A bright white showroom, centered typography, a yellow 3D platform, and the supplied SOLARSALH logo.
- Scroll through the installation to change the camera angle.
- Drag the daylight control or use its arrow keys to move between 06:00 and 18:00.
- Switch between an 8-panel home array and a 12-panel business array.
- Pause ongoing motion with the round control. Reduced-motion preferences are respected.
- Phone and email links connect to Saleh’s provided contact details.
- The energy percentage is an illustrative daylight curve, not an engineering calculation or production estimate.

## Files

- `dist/content.json`: shared brand, owner, and contact details.
- `dist/index.html`: semantic page structure and fallback copy.
- `dist/style.css`: responsive presentation.
- `dist/scene.js`: original procedural Three.js scene, solar texture, yellow display platform, lighting, and camera.
- `dist/app.js`: controls, scroll behavior, and content loading.
- `dist/assets/original-logo.jpg`: supplied logo, preserved unchanged and displayed in the header and footer.
- `server.mjs`: small local-only static server.

## Future admin page

Content is separated from presentation in `content.json`. A future admin page can replace that read with an authenticated content API and persistent storage while preserving the current scene and page components. No admin, authentication, or write endpoint has been added in this version.

## Checks

Desktop and mobile views were inspected in the desktop browser. Tested the daylight endpoints and midday, the camera transition, both array sizes, pause/resume, contact navigation, and horizontal overflow. The desktop scene ran at approximately 60 fps during inspection. JavaScript syntax checks passed.

## Credits

Three.js 0.180.0 — MIT; license in `dist/vendor/THREE-LICENSE.txt`.
Manrope, Heebo, and Tajawal — SIL Open Font License; license files in `dist/assets/`.
All scene geometry and solar textures were made in code for this project. The provided logo remains the owner’s asset.

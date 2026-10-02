# Saleh Solar System

An ivory-and-gold, interactive solar showcase for Saleh Zedany, created as a moosetvs portfolio project.

## Review online

[Open the live website](https://moosev133.github.io/saleh-solar-system/). The website and [source repository](https://github.com/moosev133/saleh-solar-system) are public.

The GitHub Pages workflow in `.github/workflows/pages.yml` publishes the `dist` folder automatically when website changes are pushed to `main`. It can also be run manually from the Actions tab.

## Open locally

Run `npm start` in this folder, then open http://localhost:4173.
On this Mac, you can also double-click `start.command`.
The server binds only to your computer and serves the `dist` folder.

The public showcase still runs without dependencies. Three.js and all fonts are bundled locally. The content backend and its local tests need `npm ci`.

## Languages

Hebrew is the default. Arabic and English are available from the header selector. Language selection is saved on the device and reflected in the `lang` URL parameter for sharing. Hebrew and Arabic use RTL layout; personal and company names remain English.

Translations are in `dist/translations.js`. Shared owner/contact information is in `dist/content.json`.

## Experience

- A layered ivory, cream, and honey-gold showroom with slowly moving sunlight, centered typography, a metallic sun platform, and the supplied SOLARSALH logo.
- A 4.65-second entrance brings sunlight from the upper left onto the panels, energizes the circuit, and reveals the website. Visitors can skip it; reduced-motion preferences bypass it.
- Individually modeled silicon wafers with subtle color variation and collector textures, separate reflective glass, extruded aluminum frames, bolts, mounts, and rear wiring.
- The close-up control separates the glass, cells, and frame. Escape or the return control restores the array.
- Contact shadows and a continuously moving golden power circuit beneath the array.
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

## Content studio

[Open the content studio](https://saleh-solar-system.meliodasin14.chatgpt.site/admin). The public website remains on GitHub Pages; its gallery reads published content from this backend. The footer also contains a management link.

- Upload JPG, PNG or WebP images (12 MiB maximum) and MP4 or WebM videos (40 MiB maximum).
- Uploads start as private drafts. Add a title and optional caption, then enable “Show this on the website” and save.
- Edit, unpublish, move an item to the beginning, or permanently delete it.
- Public photos open at full size; videos use native playback controls and support byte-range seeking.
- The gallery appears after the 3D experience once the first item is published. Empty galleries stay hidden. It loads six cards initially, with filters and a “More moments” button.
- Hebrew, Arabic and English interfaces. Uploaded titles and captions remain exactly as written, in every language.
- The library holds up to 200 items. Nothing is stored only in the browser: D1 stores records and R2 stores the media.

### Private first-time setup

Give the separately supplied activation link only to Saleh. It contains a one-time key and must never be committed to this public repository. Saleh opens it, signs in with his ChatGPT account, and selects “Activate my access”. This binds the studio to that account’s stable authenticated identity. Later, he can use the ordinary studio link and sign in with the same account. The public gallery needs no login.

The key is read from the URL fragment and removed from the address bar immediately. Only its SHA-256 hash is configured in the hosted `ADMIN_SETUP_HASH` secret. Claiming access is atomic and can happen once. Signing in alone never grants editing access. Recovering or transferring access requires the site owner to make an explicit server-side account change; there is no public reset endpoint.

### Backend and local development

The same existing Sites project now runs a Cloudflare-compatible Worker in `worker/index.js`, with logical `DB` and `BUCKET` bindings. Production identity comes only from the platform’s verified sign-in headers. Every write checks the stored owner identity and same-origin requests. File type signatures, payload sizes and text lengths are validated server-side. Draft media is also protected when its URL is requested directly.

Run `npm ci`, then `npm run dev:admin`. Open http://localhost:4174/admin. The loopback-only development server simulates sign-in and persists test data under ignored `.local-data/`. Its setup key is 64 copies of `1`. This simulation is excluded from the production Worker. `npm start` still serves the static site on port 4173 against the production read-only gallery API.

- `dist/admin.*`: studio interface and GitHub Pages entry point.
- `dist/gallery.*`: public gallery and media viewer.
- `worker/`: request handling, authorization and storage operations.
- `db/schema.ts`, `drizzle/`: schema and versioned migrations.
- `scripts/build.mjs`: packages public files and Worker output without production secrets.
- `tests/admin.test.mjs`: real local D1/R2 lifecycle and security checks.

Run `npm run check` and `npm test` before release. Generate schema changes with `npm run db:generate`; keep already deployed migrations immutable. Publish the backend through the existing Sites project, then push the public frontend to GitHub. The GitHub workflow uploads only tracked frontend files under `dist`; generated `dist/server` and `dist/.openai` are ignored and excluded from GitHub commits. Admin content updates require neither a new Git commit nor a frontend deployment.

## Checks

Desktop and mobile views were inspected in the desktop browser. Tested the daylight endpoints and midday, the camera transition, both array sizes, pause/resume, contact navigation, and horizontal overflow. The desktop scene ran at approximately 60 fps during inspection. The sunlight entrance, skip button, close-up/return/Escape controls in all three languages, pause behavior, and single-renderer handoff were checked in the browser. Reduced-motion startup and the delayed-load escape hatch passed isolated checks. JavaScript syntax checks passed.

## Credits

Three.js 0.180.0 — MIT; license in `dist/vendor/THREE-LICENSE.txt`.
Manrope, Heebo, and Tajawal — SIL Open Font License; license files in `dist/assets/`.
All scene geometry and solar textures were made in code for this project. The provided logo remains the owner’s asset.

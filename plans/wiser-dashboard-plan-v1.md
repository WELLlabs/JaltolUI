<!-- f8b3e529-ecd8-4296-add9-063b472a3310 f82836f1-fbe4-4823-a3c5-50606baf6684 -->
# WISER Globe Map MVP (Mapbox GL JS + Satellite)

### Table of contents

- Overview
- Scope (this milestone)
- Key design choices
- Implementation steps
- Manual tests (per milestone)
- Risks and mitigations
- Next steps (post-MVP)

## Overview

Build a full-screen globe-inspired map page accessible at `https://jaltol.app/wiser/dashboard`. No overlays or UI controls yet. Globe feel when zoomed out, increasingly 2D when zoomed in.

## Scope (this milestone)

- Full-screen map page in the existing React app (`JaltolUI`).
- Mapbox GL JS with `projection: 'globe'` and Mapbox Satellite style.
- Smooth zoom/pitch to feel globe-like at low zoom; flatter at higher zoom. No layers, popups, or widgets.

## Key design choices

- Library: Mapbox GL JS v2+ (supports globe projection; React-friendly).
- Base imagery: Mapbox Satellite (`mapbox://styles/mapbox/satellite-v9` or `mapbox://styles/mapbox/satellite-streets-v12` if labels needed later).
- Token management: `.env` file (e.g., `VITE_MAPBOX_TOKEN` or `REACT_APP_MAPBOX_TOKEN`, consistent with current bundler).
- Projection behavior: initialize with `projection: 'globe'`; optionally switch to `mercator` beyond a zoom threshold to emphasize 2D feel (`map.setProjection('mercator')` when `zoom >= threshold`, revert below threshold). Keep simple for MVP and revisit after UX review.

## Implementation steps (with tests)

1) Created route and page

- Added page `JaltolUI/src/pages/WiserDashboard.jsx` with a full-screen container.
- Registered route `/wiser/dashboard` in `JaltolUI/src/App.jsx`.
- Test (manual): Navigated to `/wiser/dashboard`; page rendered full-viewport with no scrollbars; resizing kept it full-screen; no console errors. Status: Passed.

2) Installed dependencies and styles

- Added `mapbox-gl` and imported Mapbox CSS globally in `src/main.jsx`.
- Ensured CSS baseline keeps the dashboard container full viewport.
- Test (manual): App compiled without errors; `mapbox-gl.css` loaded; layout remained full-viewport. Status: Passed.

3) Configured Mapbox token

- Read `VITE_MAPBOX_TOKEN` via `src/config/mapbox.js`.
- Added friendly missing-token UX in `WiserDashboard.jsx`.
- Test (manual): With valid token, style loaded without auth errors; without token, fallback message rendered and no crash. Status: Passed.

4) Initialized globe map

- Created `mapboxgl.Map` in `WiserDashboard.jsx` with `projection: 'globe'`, style `satellite-v9`, center India, zoom 3, pitch 15.
- Enabled atmospheric fog on `style.load`.
- Ensured full-screen rendering with `h-full w-full` container and `ResizeObserver` to trigger `map.resize()`.
- Test (manual): Low zoom shows curvature and fog; high zoom appears flat; smooth pan/zoom; no errors. Status: Passed.

5) Optional: zoom-based projection switch (UX toggle later)

- Listen to `zoom` events and switch projections if needed (e.g., `>= 6: 'mercator'`, `< 6: 'globe'`). Keep debounce to avoid thrash.
- For MVP, you may keep projection fixed at `'globe'` as it already flattens perceptually when zoomed in.
- Test (manual): If enabled, zoom across the threshold repeatedly; map switches projections without jitter, freezes, or style reload errors.

6) Shipped without overlays

- No controls or layers, just the base satellite map, ensuring fast load and smooth pan/zoom.
- Test (manual): Confirm minimal bundle increase; no extraneous UI; interaction remains responsive on Chrome and Edge on Windows.

## Risks and mitigations

- Missing/invalid Mapbox token → Add clear fallback UI; document `.env` setup.
- Performance on lower-end GPUs → Keep overlays off; disable terrain; keep pitch moderate.
- Style access limits → Validate account style access; consider `satellite-streets-v12` if we later need labels.

## Next steps (post-MVP)

- Add vector tiles for large pan-India datasets (tile generation pipeline with Tippecanoe/Mapbox Tilesets; or open-source stack like `tegola`/`tileserver-gl`).
- Progressive rendering controls (zoom-thresholded visibility, feature generalization).
- Basic UI: zoom controls, scale bar, attribution placement.
- Offline and caching strategy; request budgeting and CDN.
- Observability: basic performance metrics and error logging.

### To-dos

- [x] Create `WiserDashboard.jsx` and register `/wiser/dashboard` route
- [x] Install `mapbox-gl` and import Mapbox CSS globally
- [x] Add Mapbox token to `.env` and read in app config
- [x] Initialize Mapbox map (projection globe, satellite style, India center)
- [x] Handle window resize to keep map full-screen
- [x] Enable subtle atmospheric fog for globe look
- [x] Manual test: route loads, full-screen map, no scrollbars
- [x] Manual test: globe curve visible at low zoom
- [x] Manual test: flat-enough appearance at high zoom
- [x] Manual test: smooth pan/zoom, no console errors
- [ ] Plan vector tiling pipeline for pan-India datasets
- [ ] Plan minimal UI controls and attribution placement
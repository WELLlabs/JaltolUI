<!-- f8b3e529-ecd8-4296-add9-063b472a3310 c29f574f-7e58-492e-b48e-fc8849e55364 -->
# WISER Globe Map MVP (Mapbox GL JS + Satellite + Vector Tiles)

### Table of contents

- Overview
- Scope (this milestone)
- Key design choices
- Vector tiling options (MVT vs PMTiles)
- Implementation steps
- Risks and mitigations
- Next steps (post-MVP)

## Overview

Build a full-screen globe-inspired map page accessible at `https://jaltol.app/wiser/dashboard-a` (Version A) and `/wiser/dashboard-b` (Version B). Globe feel when zoomed out, increasingly 2D when zoomed in. Support for large pan-India vector datasets via MVT (Version A) and PMTiles (Version B).

**Note:** The original `/wiser/dashboard` route has been removed. Only Versions A and B are active.

## Scope (this milestone)

- Full-screen map page in the existing React app (`JaltolUI`).
- Mapbox GL JS with `projection: 'globe'` and Mapbox Satellite style.
- Smooth zoom/pitch to feel globe-like at low zoom; flatter at higher zoom. No layers, popups, or widgets.
- PMTiles vector tile support for large datasets (starting with 2MB sample, scaling to 1GB+).

## Key design choices

- Library: **Dual approach** - Testing both Mapbox GL JS (Version A) and MapLibre GL JS (Version B) to compare PMTiles integration ease.
- Base imagery: Mapbox Satellite (`mapbox://styles/mapbox/satellite-v9` or `mapbox://styles/mapbox/satellite-streets-v12` if labels needed later).
- Token management: `.env` file (e.g., `VITE_MAPBOX_TOKEN` or `REACT_APP_MAPBOX_TOKEN`, consistent with current bundler).
- Projection behavior: initialize with `projection: 'globe'`; optionally switch to `mercator` beyond a zoom threshold to emphasize 2D feel (`map.setProjection('mercator')` when `zoom >= threshold`, revert below threshold). Keep simple for MVP and revisit after UX review.
- Vector tiles: **Two versions**:
  - **Version A**: Mapbox GL JS + MVT (Mapbox-hosted vector tiles) - Native Mapbox integration, no additional libraries needed.
  - **Version B**: MapLibre GL JS + PMTiles - MapLibre has native `addProtocol()` support for PMTiles, making integration straightforward without complex fetch/XHR overrides.

## Vector tiling options

### Option 1: MVT (Mapbox Vector Tiles) - Mapbox Hosted

**What it is:**

- Standard Mapbox Vector Tiles (`.mvt` format)
- Thousands of individual tile files (one per zoom/x/y coordinate)
- Native format for Mapbox GL JS

**How it works:**

- Upload GeoJSON to Mapbox Tilesets API
- Mapbox generates and hosts tiles on their CDN
- Access via `mapbox://` protocol or HTTP tile URLs
- Requires Mapbox account and access token

**Pros:**

- Native Mapbox integration (no additional libraries)
- Excellent CDN performance
- Automatic tile generation and hosting
- Easy updates (re-upload GeoJSON)

**Cons:**

- Per-request pricing (can be expensive at scale)
- Requires Mapbox account and token
- Vendor lock-in to Mapbox infrastructure
- Less control over tile generation parameters

**Best for:** Projects already using Mapbox ecosystem, willing to pay per-request costs, want simplest hosted solution.

### Option 2: PMTiles

**What it is:**

- Single-file tile archive format (`.pmtiles`)
- All zoom levels packaged in one file with indexed random access
- Open-source format (protomaps/pmtiles)

**How it works:**

- Convert GeoJSON to `.pmtiles` using `pmtiles` CLI tool
- Upload single file to static hosting (Vercel, S3, Cloudflare R2, etc.)
- Client loads via `pmtiles` library + Mapbox GL JS plugin
- No server required - works with any CDN

**Pros:**

- No server infrastructure needed (static file hosting)
- Single file is easy to version, update, and cache
- No per-request costs (only storage/CDN bandwidth)
- Works with any CDN (Vercel, S3, Cloudflare, etc.)
- Good performance with CDN caching
- Full control over tile generation

**Cons:**

- Requires additional client library (`pmtiles`)
- Must regenerate entire file for updates (no partial updates)
- File size can be large (though still much smaller than source GeoJSON)

**Best for:** Static or semi-static datasets, projects wanting to avoid server infrastructure, cost-sensitive deployments, full control over hosting.

**Decision:** Testing both approaches:
- **Version A (MVT/Mapbox)**: For comparison and as a fallback if PMTiles proves difficult.
- **Version B (PMTiles/MapLibre)**: Primary focus due to no server requirements, cost efficiency, and compatibility with existing Vercel deployment. MapLibre's native PMTiles support (`addProtocol()`) eliminates the complex workarounds needed with Mapbox GL JS.

**Reason for dual approach:** Mapbox GL JS integration with PMTiles required complex fetch/XHR overrides and encountered "Unimplemented type: 4" errors. MapLibre GL JS has built-in protocol support (`maplibregl.addProtocol('pmtiles', protocol.tile)`) making PMTiles integration straightforward. Both versions will be tested to determine the best path forward.

## Vector data structure

The vector tiles contain multiple years of data with the following property naming convention:

- **Continuous values**: Properties named `CI_506`, `CI_1011`, `CI_1112`, ..., `CI_2324` (format: `CI_YYZZ` where YY-ZZ represents the year range, e.g., `CI_2324` = 2023-2024).
- **Discrete bin values**: Properties named `BIN_506`, `BIN_1011`, `BIN_1112`, ..., `BIN_2324` with integer values 1-5 representing:
  - 1 = Very Low
  - 2 = Low
  - 3 = Moderate
  - 4 = High
  - 5 = Very High

**Current implementation:** Both dashboard versions use discrete BIN values for styling (e.g., `BIN_2324` for the latest year) with a `match` expression mapping each bin value (1-5) to a color in the RdYlGn (Red-Yellow-Green) scale.

## Implementation steps (with tests)

**Note:** Two dashboard versions created:
- **Version A** (`/wiser/dashboard-a`): Mapbox GL JS + MVT (Mapbox-hosted) - `WiserDashboardA.jsx`
- **Version B** (`/wiser/dashboard-b`): MapLibre GL JS + PMTiles - `WiserDashboardB.jsx`
- Both accessible from `/wiser` page via separate "View Indicators" buttons.

1) Created route and page

- Added page `JaltolUI/src/pages/WiserDashboard.jsx` with a full-screen container (now deprecated).
- Registered route `/wiser/dashboard` in `JaltolUI/src/App.jsx` (now removed).
- Test (manual): Navigated to `/wiser/dashboard`; page rendered full-viewport with no scrollbars; resizing kept it full-screen; no console errors. Status: Passed (route now inactive).

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

5) Converted sample GeoJSON to PMTiles

- Sample GeoJSON file located at `JaltolUI/public/vectors/Raichur_CI.geojson`.
- Used Google Cloud Shell for conversion (Tippecanoe doesn't run natively on Windows).
- Uploaded GeoJSON file to Cloud Shell via web UI (three-dot menu → Upload file).
- Installed Tippecanoe via pip3: `pip3 install tippecanoe`.
- Added `~/.local/bin` to PATH: `export PATH="$HOME/.local/bin:$PATH"`.
- Converted GeoJSON → MBTiles: `tippecanoe -o Raichur_CI.mbtiles Raichur_CI.geojson` (generated 6.5MB MBTiles file from 2MB GeoJSON).
- Installed PMTiles Python package: `pip3 install pmtiles`.
- Converted MBTiles → PMTiles: `pmtiles-convert Raichur_CI.mbtiles Raichur_CI.pmtiles` (Python package version).
- Downloaded PMTiles file from Cloud Shell (three-dot menu → Download file).
- Test (manual): PMTiles file generated successfully; file size reasonable; file structure valid. Status: Passed.

6) Hosted PMTiles file

- Placed PMTiles file at `JaltolUI/public/vectors/Raichur_CI.pmtiles`.
- File will be accessible via Vercel static hosting at `/vectors/Raichur_CI.pmtiles` (or full URL: `https://jaltol.app/vectors/Raichur_CI.pmtiles`).
- No CORS headers needed since it's served from same domain.
- Test (manual): PMTiles file URL is accessible via browser; returns proper content-type. Status: Pending (will test after integration).

7) Created dual dashboard versions

- **Version A** (`WiserDashboardA.jsx`): Mapbox GL JS with Mapbox-hosted MVT tiles. Uses Mapbox Satellite Streets (`mapbox://styles/mapbox/satellite-streets-v12`) with globe projection for denser labels.
- **Version B** (`WiserDashboardB.jsx`): MapLibre GL JS with PMTiles integration using native `maplibregl.addProtocol('pmtiles', protocol.tile)` support. Uses ESRI hybrid satellite imagery with globe projection.
- Added routes `/wiser/dashboard-a` and `/wiser/dashboard-b` in `App.jsx`.
- Removed old `/wiser/dashboard` route (no longer active).
- Updated `/wiser` page with two "View Indicators" buttons linking to both versions.
- **Dependencies**: Version B requires `maplibre-gl` package (installed: `npm install maplibre-gl`).
- Test (manual): Both routes accessible; buttons navigate correctly. Status: Passed.

8) Integrated Mapbox-hosted MVT tiles (Version A)

- Added Mapbox tileset source (`mapbox://jaltol.d59xt63p`) to `WiserDashboardA.jsx`.
- Source-layer name: `Raichur_CI_bin-62et6r`.
- Configured globe projection with pitch 15, zoom 4, center India.
- Test (manual): Map loads with Mapbox satellite imagery; globe projection visible; no console errors. Status: Passed.

9) Implemented discrete BIN value styling (Version A)

- Switched from continuous interpolation to discrete `match` expressions for styling.
- Updated fill and outline layers to use `BIN_2324` property (discrete values 1-5).
- Color mapping:
  - 1 (Very Low) → Red `rgb(220, 5, 12)`
  - 2 (Low) → Orange `rgb(255, 152, 0)`
  - 3 (Moderate) → Yellow `rgb(255, 255, 84)`
  - 4 (High) → Light Green `rgb(144, 238, 144)`
  - 5 (Very High) → Green `rgb(26, 152, 80)`
- Both fill and outline layers use the same source-layer (`Raichur_CI_bin-62et6r`) for consistency.
- Test (manual): Vector layers render with discrete color categories; colors match BIN values correctly; no console errors. Status: Passed.

10) Added WISER Info Panel (Version A)

- Implemented an absolutely positioned InfoPanel component with back navigation and expandable space for future content.
- Test (manual): Panel displays correctly on mobile/desktop; expand/collapse animations work. Status: Passed.

11) Added Year Slider control (Version A)

- Created a bottom-centered YearSlider component with prev/next buttons, range input, and active-year indicator.
- Test (manual): Changing the slider updates the BIN property used for styling; map colors refresh instantly. Status: Passed.

12) Added zoom-aware styling and labels (Version A)

- Fill opacity now fades out above zoom 9 so only outlines remain at high zoom; village labels (via `village_na`) appear at zoom ≥10.
- Test (manual): Fill disappears when zoomed in; labels show after zoom threshold; no console errors. Status: Passed.

10) Integrate PMTiles library with MapLibre GL JS (Version B)

- Imported `PMTiles` and `Protocol` from `pmtiles` library in `WiserDashboardB.jsx`.
- Registered PMTiles protocol handler with MapLibre GL JS using `maplibregl.addProtocol('pmtiles', protocol.tile)`.
- MapLibre natively supports custom protocols, eliminating the need for fetch/XHR overrides.
- Test (manual): No console errors on import; PMTiles protocol handler registered successfully. Status: Pending.

11) Add PMTiles vector source to map (Version B)

- Add PMTiles source to map using `map.addSource()` with `type: 'vector'` and PMTiles URL (`pmtiles:///vectors/Raichur_CI.pmtiles`).
- Configure source with appropriate min/max zoom from PMTiles header metadata.
- Test (manual): Source added without errors; map `load` event fires; source appears in `map.getStyle().sources`. Status: Pending.

12) Create and style vector layer with discrete BIN values (Version B)

- Add vector layer using `map.addLayer()` referencing the PMTiles source.
- Use discrete `match` expressions with `BIN_2324` property (same as Version A).
- Apply same color mapping as Version A (1-5 → Red-Yellow-Green scale).
- Set zoom-based visibility thresholds if needed (e.g., show only at zoom >= 5).
- Test (manual): Layer renders on map; features visible at appropriate zoom levels; discrete BIN styling applied correctly; no console errors. Status: Pending.

13) Test with sample dataset

- Load both versions with 2MB sample dataset.
- Verify smooth pan/zoom performance.
- Check initial load time (< 10s target).
- Verify features render correctly at different zoom levels.
- Compare performance between Version A (MVT) and Version B (PMTiles).
- Test (manual): Both maps load in < 10s; pan/zoom is smooth (60fps); features visible and styled correctly; discrete BIN colors render properly; no memory leaks or performance degradation over time. Status: Pending.

14) Optimize for production

- Review and adjust tile generation parameters if needed (simplification, min/max zoom).
- Implement zoom-based feature visibility to reduce rendering load.
- Add error handling for vector tile loading failures (both versions).
- Test (manual): Performance remains smooth with full dataset; error messages appear if tiles fail to load; no unnecessary features rendered at low zoom. Status: Pending.

## Risks and mitigations

- Missing/invalid Mapbox token → Add clear fallback UI; document `.env` setup.
- Performance on lower-end GPUs → Keep overlays off; disable terrain; keep pitch moderate; implement zoom-based visibility.
- Style access limits → Validate account style access; consider `satellite-streets-v12` if we later need labels.
- PMTiles file too large → Optimize tile generation (higher simplification, lower max zoom); consider splitting into multiple files by region.
- PMTiles loading failures → Add retry logic and user-friendly error messages; fallback to empty state.
- CORS issues with external hosting → Ensure proper CORS headers; consider hosting in Vercel `public/` directory.

## Next steps (post-MVP)

- Scale to 1GB+ full pan-India dataset (optimize tile generation, consider regional splits).
- Progressive rendering controls (zoom-thresholded visibility, feature generalization).
- Basic UI: zoom controls, scale bar, attribution placement.
- Offline and caching strategy; request budgeting and CDN optimization.
- Observability: basic performance metrics and error logging.
- Feature interactivity (click handlers, popups, tooltips).

### To-dos

- [x] Create `WiserDashboard.jsx` and register `/wiser/dashboard` route (deprecated, route removed)
- [x] Install `mapbox-gl` and import Mapbox CSS globally
- [x] Add Mapbox token to `.env` and read in app config
- [x] Initialize Mapbox map (projection globe, satellite style, India center)
- [x] Handle window resize to keep map full-screen
- [x] Enable subtle atmospheric fog for globe look
- [x] Manual test: route loads, full-screen map, no scrollbars
- [x] Manual test: globe curve visible at low zoom
- [x] Manual test: flat-enough appearance at high zoom
- [x] Manual test: smooth pan/zoom, no console errors
- [x] Convert sample 2MB GeoJSON to PMTiles format
- [x] Host PMTiles file (Vercel public/ or external CDN)
- [x] Create dual dashboard versions (A: Mapbox MVT, B: MapLibre PMTiles)
- [x] Add routes and navigation buttons for both versions
- [x] Remove old `/wiser/dashboard` route
- [x] Install `maplibre-gl` package for Version B
- [x] Integrate Mapbox-hosted MVT tiles (Version A)
- [x] Implement discrete BIN value styling (Version A) - using `BIN_2324` with match expressions
- [ ] Integrate PMTiles library with MapLibre GL JS (Version B)
- [ ] Add PMTiles vector source to map (Version B)
- [ ] Create and style vector layer with discrete BIN values (Version B)
- [ ] Test Version B with 2MB sample dataset (load time, performance, rendering)
- [ ] Compare Version A vs Version B performance and integration ease
- [ ] Optimize tile generation and rendering for production
- [ ] Manual test: PMTiles file accessible and valid
- [ ] Manual test: PMTiles protocol handler registered (Version B)
- [ ] Manual test: Vector source added successfully (Version B)
- [ ] Manual test: Layer renders with discrete BIN styling (Version B)
- [ ] Manual test: Map loads in < 10s with sample dataset
- [ ] Manual test: Smooth pan/zoom performance (60fps)
- [ ] Manual test: Features visible at appropriate zoom levels
- [ ] Manual test: Error handling for PMTiles loading failures
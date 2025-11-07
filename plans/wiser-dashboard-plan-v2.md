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

Build a full-screen globe-inspired map page accessible at `https://jaltol.app/wiser/dashboard`. No overlays or UI controls yet. Globe feel when zoomed out, increasingly 2D when zoomed in. Support for large pan-India vector datasets via PMTiles.

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

## Implementation steps (with tests)

**Note:** Two dashboard versions created:
- **Version A** (`/wiser/dashboard-a`): Mapbox GL JS + MVT (Mapbox-hosted) - `WiserDashboardA.jsx`
- **Version B** (`/wiser/dashboard-b`): MapLibre GL JS + PMTiles - `WiserDashboardB.jsx`
- Both accessible from `/wiser` page via separate "View Indicators" buttons.

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

- **Version A** (`WiserDashboardA.jsx`): Simplified Mapbox GL JS implementation, ready for Mapbox-hosted MVT tiles. No PMTiles integration.
- **Version B** (`WiserDashboardB.jsx`): MapLibre GL JS with PMTiles integration using native `maplibregl.addProtocol('pmtiles', protocol.tile)` support.
- Added routes `/wiser/dashboard-a` and `/wiser/dashboard-b` in `App.jsx`.
- Updated `/wiser` page with two "View Indicators" buttons linking to both versions.
- **Dependencies**: Version B requires `maplibre-gl` package (to be installed: `npm install maplibre-gl`).
- Test (manual): Both routes accessible; buttons navigate correctly. Status: Passed.

7a) Integrated PMTiles library with MapLibre GL JS (Version B)

- Imported `PMTiles` and `Protocol` from `pmtiles` library in `WiserDashboardB.jsx`.
- Registered PMTiles protocol handler with MapLibre GL JS using `maplibregl.addProtocol('pmtiles', protocol.tile)`.
- MapLibre natively supports custom protocols, eliminating the need for fetch/XHR overrides.
- Test (manual): No console errors on import; PMTiles protocol handler registered successfully. Status: Pending (requires maplibre-gl installation).

8) Add PMTiles vector source to map

- Add PMTiles source to map using `map.addSource()` with `type: 'vector'` and PMTiles URL.
- Configure source with appropriate min/max zoom and bounds if needed.
- Test (manual): Source added without errors; map `load` event fires; source appears in `map.getStyle().sources`. Status: Pending.

9) Create and style vector layer

- Add vector layer using `map.addLayer()` referencing the PMTiles source.
- Configure layer style (fill, stroke, opacity, color) appropriate for dataset.
- Set zoom-based visibility thresholds if needed (e.g., show only at zoom >= 5).
- Test (manual): Layer renders on map; features visible at appropriate zoom levels; styling applied correctly; no console errors. Status: Pending.

10) Test with sample dataset

- Load map with 2MB sample dataset.
- Verify smooth pan/zoom performance.
- Check initial load time (< 10s target).
- Verify features render correctly at different zoom levels.
- Test (manual): Map loads in < 10s; pan/zoom is smooth (60fps); features visible and styled correctly; no memory leaks or performance degradation over time. Status: Pending.

11) Optimize for production

- Review and adjust tile generation parameters if needed (simplification, min/max zoom).
- Implement zoom-based feature visibility to reduce rendering load.
- Add error handling for PMTiles loading failures.
- Test (manual): Performance remains smooth with full dataset; error messages appear if PMTiles fails to load; no unnecessary features rendered at low zoom. Status: Pending.

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
- [x] Convert sample 2MB GeoJSON to PMTiles format
- [x] Host PMTiles file (Vercel public/ or external CDN)
- [x] Create dual dashboard versions (A: Mapbox MVT, B: MapLibre PMTiles)
- [x] Add routes and navigation buttons for both versions
- [ ] Install `maplibre-gl` package for Version B
- [ ] Add PMTiles vector source to map (Version B)
- [ ] Create and style vector layer from PMTiles source (Version B)
- [ ] Test Version B with 2MB sample dataset (load time, performance, rendering)
- [ ] Compare Version A vs Version B performance and integration ease
- [ ] Optimize tile generation and rendering for production
- [ ] Manual test: PMTiles file accessible and valid
- [ ] Manual test: PMTiles protocol handler registered (Version B)
- [ ] Manual test: Vector source added successfully (Version B)
- [ ] Manual test: Layer renders with correct styling (Version B)
- [ ] Manual test: Map loads in < 10s with sample dataset
- [ ] Manual test: Smooth pan/zoom performance (60fps)
- [ ] Manual test: Features visible at appropriate zoom levels
- [ ] Manual test: Error handling for PMTiles loading failures
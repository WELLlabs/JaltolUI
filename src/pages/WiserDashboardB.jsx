import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { PMTiles, Protocol } from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';

// Create PMTiles protocol instance
const protocol = new Protocol();

function WiserDashboardB() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const pmtilesRef = useRef(null);

  useEffect(() => {
    document.title = 'WISER Dashboard (Version B - PMTiles + MapLibre)';
  }, []);

  useEffect(() => {
    // Load PMTiles file and add to protocol
    const pmtilesUrl = '/vectors/Raichur_CI.pmtiles';
    const pmtiles = new PMTiles(pmtilesUrl);
    protocol.add(pmtiles);
    pmtilesRef.current = pmtiles;

    // Register PMTiles protocol with MapLibre (native support!)
    maplibregl.addProtocol('pmtiles', protocol.tile);

    // Use ESRI hybrid satellite imagery (satellite + labels) with globe projection
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'esri-satellite': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '© Esri'
          },
          'esri-labels': {
            type: 'raster',
            tiles: [
              'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}'
            ],
            tileSize: 256,
            attribution: '© Esri'
          }
        },
        layers: [
          {
            id: 'esri-satellite-layer',
            type: 'raster',
            source: 'esri-satellite',
            minzoom: 0,
            maxzoom: 19
          },
          {
            id: 'esri-labels-layer',
            type: 'raster',
            source: 'esri-labels',
            minzoom: 0,
            maxzoom: 19
          }
        ]
      },
      projection: 'globe', // Enable 3D globe projection
      center: [78.9629, 20.5937], // India centroid
      zoom: 4, // Start at zoom level 5
      pitch: 15, // Slight pitch for 3D effect
      bearing: 0,
      attributionControl: true,
    });

    mapRef.current = map;
    setupMapEvents(map, pmtiles, pmtilesUrl);

    // Setup map events (called after map is created)
    function setupMapEvents(map, pmtiles, pmtilesUrl) {
      map.on('style.load', () => {
        console.log('[WISER B] style.load');
        console.log('[WISER B] Current projection:', map.getProjection());
        
        // Ensure globe projection is set (try both methods)
        try {
          map.setProjection({ type: 'globe' });
          console.log('[WISER B] Globe projection set via setProjection({ type: "globe" })');
          console.log('[WISER B] Projection after set:', map.getProjection());
        } catch (e) {
          console.warn('[WISER B] Could not set globe projection:', e);
        }
        
        try {
          // Add atmospheric fog for globe effect
          map.setFog({
            range: [0.5, 10],
            color: 'white',
            'high-color': '#245bdb',
            'space-color': '#000000',
            'star-intensity': 0.15
          });
          console.log('[WISER B] Fog set for globe effect');
        } catch (_) {
          // ignore if fog not supported on current device
        }
        setTimeout(() => map.resize(), 0);
      });

      map.on('load', async () => {
        console.log('[WISER B] map load');
        console.log('[WISER B] Projection on load:', map.getProjection());
        console.log('[WISER B] Zoom:', map.getZoom());
        console.log('[WISER B] Pitch:', map.getPitch());
        
        // Force globe projection again after load
        try {
          map.setProjection({ type: 'globe' });
          console.log('[WISER B] Globe projection forced after load');
        } catch (e) {
          console.warn('[WISER B] Could not force globe projection:', e);
        }

        // Add PMTiles vector source after map loads
        try {
          // Get PMTiles metadata to determine min/max zoom
          const header = await pmtiles.getHeader();
          console.log('[WISER B] PMTiles header:', {
            tileType: header.tileType,
            minZoom: header.minZoom,
            maxZoom: header.maxZoom,
            tileCompression: header.tileCompression,
          });
          const minZoom = header.minZoom || 0;
          const maxZoom = header.maxZoom || 14;

          // MapLibre natively supports pmtiles:// URLs!
          const pmtilesUrlProtocol = `pmtiles://${pmtilesUrl}`;

          map.addSource('raichur-vector', {
            type: 'vector',
            url: pmtilesUrlProtocol,
            minzoom: minZoom,
            maxzoom: maxZoom,
          });
          console.log('[WISER B] PMTiles source added', { minZoom, maxZoom });

          // Get the source-layer name from PMTiles metadata
          const metadata = await pmtiles.getMetadata();
          const sourceLayerName = metadata?.json?.vector_layers?.[0]?.id ||
                                  metadata?.json?.name ||
                                  'Raichur_CI';

          console.log('[WISER B] Source layer name:', sourceLayerName);

          // Add a fill layer to display the vector polygons
          // Style based on "2324" property (2023-2024 year) with RdYlGn color scale (0=red, 1=green)
          map.addLayer({
            id: 'raichur-fill',
            type: 'fill',
            source: 'raichur-vector',
            'source-layer': sourceLayerName,
            paint: {
              'fill-color': [
                'interpolate',
                ['linear'],
                ['get', '2324'], // Property name for year 2023-2024
                0, // Minimum value -> Red
                'rgb(220, 5, 12)', // Red color
                0.5, // Mid value -> Yellow
                'rgb(255, 255, 84)', // Yellow color
                1, // Maximum value -> Green
                'rgb(26, 152, 80)' // Green color
              ],
              'fill-opacity': 0.7,
            },
          });

          // Add an outline layer for better visibility
          map.addLayer({
            id: 'raichur-outline',
            type: 'line',
            source: 'raichur-vector',
            'source-layer': sourceLayerName,
            paint: {
              'line-color': [
                'interpolate',
                ['linear'],
                ['get', '2324'], // Match fill color based on same property
                0,
                'rgb(180, 0, 0)', // Darker red for outline
                0.5,
                'rgb(200, 200, 0)', // Darker yellow for outline
                1,
                'rgb(0, 120, 60)' // Darker green for outline
              ],
              'line-width': 1.5,
              'line-opacity': 0.9,
            },
          });

          console.log('[WISER B] Vector layers added');
        } catch (error) {
          console.error('[WISER B] Error adding PMTiles source:', error);
        }
      });

      map.on('idle', () => console.log('[WISER B] map idle'));
      map.on('error', (e) => console.error('[WISER B] map error', e?.error || e));

      // Setup resize handlers
      const onResize = () => { if (map) map.resize(); };
      window.addEventListener('resize', onResize);

      let resizeObserver = null;
      if (window.ResizeObserver && mapContainerRef.current) {
        resizeObserver = new ResizeObserver(() => {
          if (map) map.resize();
        });
        resizeObserver.observe(mapContainerRef.current);
      }

      // Store cleanup function on map instance
      map._cleanup = () => {
        window.removeEventListener('resize', onResize);
        if (resizeObserver) {
          try { resizeObserver.disconnect(); } catch (_) {}
          resizeObserver = null;
        }
      };
    }

    // Return cleanup function
    return () => {
      if (mapRef.current) {
        if (mapRef.current._cleanup) {
          mapRef.current._cleanup();
        }
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      <div className="h-full w-full">
        <div ref={mapContainerRef} className="h-full w-full" aria-label="WISER Map Container (Version B - PMTiles + MapLibre)" />
      </div>
    </div>
  );
}

export default WiserDashboardB;


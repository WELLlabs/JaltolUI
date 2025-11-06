import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { isMapboxTokenConfigured, getMapboxToken } from '../config/mapbox';

function WiserDashboardA() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    document.title = 'WISER Dashboard (Version A - Mapbox MVT)';
  }, []);

  useEffect(() => {
    if (!isMapboxTokenConfigured()) return;

    mapboxgl.accessToken = getMapboxToken();
    console.log('[WISER A] Mapbox token configured:', !!mapboxgl.accessToken);

    // Use ESRI hybrid satellite imagery (satellite + labels) with globe projection
    // Note: Mapbox GL JS can use custom styles with external tile sources
    const map = new mapboxgl.Map({
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
      projection: 'globe',
      center: [78.9629, 20.5937], // India centroid
      zoom: 4,
      pitch: 15,
      bearing: 0,
      attributionControl: true,
    });

    mapRef.current = map;

    map.on('style.load', () => {
      console.log('[WISER A] style.load');
      console.log('[WISER A] Current projection:', map.getProjection());
      
      // Ensure globe projection is set
      try {
        map.setProjection('globe');
        console.log('[WISER A] Globe projection set');
        console.log('[WISER A] Projection after set:', map.getProjection());
      } catch (e) {
        console.warn('[WISER A] Could not set globe projection:', e);
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
        console.log('[WISER A] Fog set for globe effect');
      } catch (_) {
        // ignore if fog not supported on current device
      }
      setTimeout(() => map.resize(), 0);
    });

    map.on('load', () => {
      console.log('[WISER A] map load');
      console.log('[WISER A] Projection on load:', map.getProjection());
      console.log('[WISER A] Zoom:', map.getZoom());
      console.log('[WISER A] Pitch:', map.getPitch());
      
      // Force globe projection again after load
      try {
        map.setProjection('globe');
        console.log('[WISER A] Globe projection forced after load');
      } catch (e) {
        console.warn('[WISER A] Could not force globe projection:', e);
      }

      // Add Mapbox-hosted MVT vector source
      try {
        map.addSource('raichur-vector', {
          type: 'vector',
          url: 'mapbox://jaltol.8rvoxg2a'
        });
        console.log('[WISER A] Mapbox tileset source added');

        // Add fill layer with data-driven styling based on "2324" property
        map.addLayer({
          id: 'raichur-fill',
          type: 'fill',
          source: 'raichur-vector',
          'source-layer': 'Raichur_CI-d0nxka', // Source-layer name from Mapbox tileset
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

        // Add outline layer for better visibility
        map.addLayer({
          id: 'raichur-outline',
          type: 'line',
          source: 'raichur-vector',
          'source-layer': 'Raichur_CI-d0nxka',
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

        console.log('[WISER A] Vector layers added with RdYlGn color scale');
      } catch (error) {
        console.error('[WISER A] Error adding Mapbox tileset source:', error);
        // If source-layer name is wrong, try common alternatives
        console.log('[WISER A] If layers don\'t appear, the source-layer name might be different.');
        console.log('[WISER A] Common alternatives: "Raichur_CI", "raichur_ci", or check Mapbox Studio for the exact name.');
      }
    });

    map.on('idle', () => console.log('[WISER A] map idle'));
    map.on('error', (e) => console.error('[WISER A] map error', e?.error || e));

    const onResize = () => { if (map) map.resize(); };
    window.addEventListener('resize', onResize);

    let resizeObserver = null;
    if (window.ResizeObserver && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        if (map) map.resize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', onResize);
      if (resizeObserver) {
        try { resizeObserver.disconnect(); } catch (_) {}
        resizeObserver = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black">
      {!isMapboxTokenConfigured() ? (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          <div className="text-center px-4">
            <h1 className="text-xl font-semibold">Mapbox token not configured</h1>
            <p className="mt-2 opacity-80">Add VITE_MAPBOX_TOKEN to your .env.local and reload.</p>
          </div>
        </div>
      ) : (
        <div className="h-full w-full">
          <div ref={mapContainerRef} className="h-full w-full" aria-label="WISER Globe Map Container (Version A)" />
        </div>
      )}
    </div>
  );
}

export default WiserDashboardA;


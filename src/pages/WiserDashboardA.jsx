import { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { isMapboxTokenConfigured, getMapboxToken } from '../config/mapbox';
import InfoPanel from '../components/Wiser/InfoPanel';
import YearSlider from '../components/Wiser/YearSlider';

const START_YEAR = 2005;
const END_YEAR = 2023;

const YEARS = Array.from({ length: END_YEAR - START_YEAR + 1 }, (_, index) => START_YEAR + index);

const getBinPropertyForYear = (year) => {
  const start = year % 100;
  const end = (year + 1) % 100;
  const startPart = start < 10 ? `${start}` : `${start}`;
  const endPart = end < 10 ? `0${end}` : `${end}`;
  return `BIN_${startPart}${endPart}`;
};

const createFillColorExpression = (property) => [
  'match',
  ['get', property],
  1, 'rgb(215, 25, 28)',
  2, 'rgb(253, 174, 97)',
  3, 'rgb(255, 255, 191)',
  4, 'rgb(171, 217, 233)',
  5, 'rgb(44, 123, 182)', 
  'rgb(200, 200, 200)',
];

const createOutlineColorExpression = (property) => [
  'match',
  ['get', property],
  1, 'rgb(215, 25, 28)',
  2, 'rgb(253, 174, 97)',
  3, 'rgb(255, 255, 191)',
  4, 'rgb(171, 217, 233)',
  5, 'rgb(44, 123, 182)',
  'rgb(150, 150, 150)',
];

const FILL_OPACITY_EXPRESSION = [
  'interpolate',
  ['linear'],
  ['zoom'],
  0, 0.7,
  8.9, 0.7,
  9, 0,
  22, 0,
];

function WiserDashboardA() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [selectedYear, setSelectedYear] = useState(END_YEAR);
  const [mapReady, setMapReady] = useState(false);
  const years = useMemo(() => YEARS, []);

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
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
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
        map.addSource('karnataka-vector', {
          type: 'vector',
          url: 'mapbox://jaltol.4a5b6c7d'
        });
        console.log('[WISER A] Mapbox tileset source added');

        const initialProperty = getBinPropertyForYear(selectedYear);

        map.addLayer({
          id: 'karnataka-fill',
          type: 'fill',
          source: 'karnataka-vector',
          'source-layer': 'layer', // Source-layer name from Mapbox tileset
          paint: {
            'fill-color': createFillColorExpression(initialProperty),
            'fill-opacity': FILL_OPACITY_EXPRESSION,
          },
        });

        // Add outline layer for better visibility
        map.addLayer({
          id: 'karnataka-outline',
          type: 'line',
          source: 'karnataka-vector',
          'source-layer': 'layer', // Use same source-layer as fill
          paint: {
            'line-color': createOutlineColorExpression(initialProperty),
            'line-width': 1.5,
            'line-opacity': 0.9,
          },
        });

        map.addLayer({
          id: 'karnataka-labels',
          type: 'symbol',
          source: 'karnataka-vector',
          'source-layer': 'layer',
          minzoom: 10,
          layout: {
            'text-field': [
              'coalesce',
              ['get', 'village_na'],
            ],
            'text-size': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 11,
              14, 16,
            ],
            'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
            'text-allow-overlap': false,
            'text-transform': 'capitalize',
          },
          paint: {
            'text-color': '#111111',
            'text-halo-color': 'rgba(255,255,255,0.85)',
            'text-halo-width': 1.4,
            'text-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 0,
              10.4, 1,
            ],
          },
        });

        console.log('[WISER A] Vector layers added with discrete BIN color scale (1-5)');
        setMapReady(true);
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

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const map = mapRef.current;
    const property = getBinPropertyForYear(selectedYear);
    const fillExpression = createFillColorExpression(property);
    const outlineExpression = createOutlineColorExpression(property);

    if (map.getLayer('raichur-fill')) {
      map.setPaintProperty('raichur-fill', 'fill-color', fillExpression);
    }
    if (map.getLayer('raichur-outline')) {
      map.setPaintProperty('raichur-outline', 'line-color', outlineExpression);
    }
  }, [selectedYear, mapReady]);

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
        <div className="h-full w-full relative">
          <div ref={mapContainerRef} className="h-full w-full" aria-label="WISER Globe Map Container (Version A)" />
          <InfoPanel />
          <YearSlider years={years} selectedYear={selectedYear} onYearChange={setSelectedYear} />
        </div>
      )}
    </div>
  );
}

export default WiserDashboardA;


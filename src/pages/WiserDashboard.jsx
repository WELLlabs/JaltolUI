import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { isMapboxTokenConfigured, getMapboxToken } from '../config/mapbox';

function WiserDashboard() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    document.title = 'WISER Dashboard';
  }, []);

  useEffect(() => {
    if (!isMapboxTokenConfigured()) return;

    mapboxgl.accessToken = getMapboxToken();
    console.log('[WISER] Mapbox token configured:', !!mapboxgl.accessToken);

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      projection: 'globe',
      center: [78.9629, 20.5937], // India centroid
      zoom: 3,
      pitch: 15,
      bearing: 0,
      attributionControl: true,
    });

    mapRef.current = map;

    map.on('style.load', () => {
      console.log('[WISER] style.load');
      try {
        map.setFog({});
      } catch (_) {
        // ignore if fog not supported on current device
      }
      // Ensure first layout after style load
      setTimeout(() => map.resize(), 0);
    });

    map.on('load', () => console.log('[WISER] map load'));
    map.on('idle', () => console.log('[WISER] map idle'));
    map.on('error', (e) => console.error('[WISER] map error', e?.error || e));

    const onResize = () => { if (map) map.resize(); };
    window.addEventListener('resize', onResize);

    // Observe container size to ensure canvas matches full viewport
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
          <div ref={mapContainerRef} className="h-full w-full" aria-label="WISER Globe Map Container" />
        </div>
      )}
    </div>
  );
}

export default WiserDashboard;



import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { PMTiles, Protocol } from 'pmtiles';
import { isMapboxTokenConfigured, getMapboxToken } from '../config/mapbox';

// Create PMTiles protocol instance for handling pmtiles:// URLs
const protocol = new Protocol();

function WiserDashboard() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const pmtilesRef = useRef(null);

  useEffect(() => {
    document.title = 'WISER Dashboard';
  }, []);

  useEffect(() => {
    if (!isMapboxTokenConfigured()) return;

    mapboxgl.accessToken = getMapboxToken();
    console.log('[WISER] Mapbox token configured:', !!mapboxgl.accessToken);

    // Load PMTiles file and add to protocol
    const pmtilesUrl = '/vectors/Raichur_CI.pmtiles';
    const pmtiles = new PMTiles(pmtilesUrl);
    protocol.add(pmtiles);
    pmtilesRef.current = pmtiles;

    // Store original fetch and XMLHttpRequest before overriding
    const originalFetch = window.fetch;
    const OriginalXHR = window.XMLHttpRequest;
    
    // Override XMLHttpRequest to intercept PMTiles tile requests (Mapbox uses XHR for tiles)
    window.XMLHttpRequest = function(...args) {
      const xhr = new OriginalXHR(...args);
      const originalOpen = xhr.open;
      const originalSend = xhr.send;
      const originalSetRequestHeader = xhr.setRequestHeader;
      let requestUrl = null;
      let requestMethod = null;
      
      xhr.open = function(method, url, ...rest) {
        requestMethod = method;
        requestUrl = url;
        
        // Log all XHR requests for debugging
        if (url && (url.includes('pmtiles') || url.includes('tile') || url.includes('vector') || url.includes('proxy'))) {
          console.log('[WISER DEBUG] XMLHttpRequest.open:', method, url);
        }
        
        // Intercept proxy URLs
        if (url && url.includes('/pmtiles-proxy/')) {
          console.log('[WISER] Intercepting PMTiles proxy request via XHR:', url);
          // Extract z/x/y from URL
          const match = url.match(/\/pmtiles-proxy\/(\d+)\/(\d+)\/(\d+)/);
          if (match) {
            const [, z, x, y] = match;
            const tileKey = `${z}/${x}/${y}`;
            
            // Store tile data here (will be populated asynchronously)
            let tileDataBuffer = null;
            let isLoading = true;
            
            // Fetch tile data asynchronously
            (async () => {
              try {
                const result = await pmtiles.getZxy(parseInt(z), parseInt(x), parseInt(y));
                
                if (result && result.data) {
                  let tileData = result.data;
                  
                  // Check if data is compressed (gzip magic bytes: 0x1f 0x8b)
                  const view = new Uint8Array(tileData);
                  const isGzipped = view.length >= 2 && view[0] === 0x1f && view[1] === 0x8b;
                  
                  if (isGzipped) {
                    console.log('[WISER] Tile data is compressed, decompressing...', tileKey);
                    const stream = new DecompressionStream('gzip');
                    const writer = stream.writable.getWriter();
                    await writer.write(tileData);
                    await writer.close();
                    const decompressed = await new Response(stream.readable).arrayBuffer();
                    tileData = decompressed;
                    console.log('[WISER] Tile decompressed successfully', tileKey, 'size:', tileData.byteLength);
                  }
                  
                  // Sanity check
                  const firstBytes = new Uint8Array(tileData.slice(0, 10));
                  const firstChars = String.fromCharCode(...firstBytes.slice(0, 5));
                  if (firstChars.startsWith('<') || firstChars.startsWith('HTTP')) {
                    console.error('[WISER] Tile data appears to be HTML/error, not MVT:', firstChars);
                    tileDataBuffer = new ArrayBuffer(0);
                  } else {
                    console.log('[WISER] PMTiles tile ready via XHR:', tileKey, 'size:', tileData.byteLength);
                    tileDataBuffer = tileData;
                  }
                } else {
                  console.warn('[WISER] PMTiles tile not found or has no data:', tileKey);
                  tileDataBuffer = new ArrayBuffer(0);
                }
              } catch (error) {
                console.error('[WISER] PMTiles tile fetch error via XHR:', error);
                tileDataBuffer = new ArrayBuffer(0);
              } finally {
                isLoading = false;
                // Trigger XHR completion
                Object.defineProperty(xhr, 'readyState', { value: 4, writable: false, configurable: true });
                Object.defineProperty(xhr, 'status', { value: 200, writable: false, configurable: true });
                Object.defineProperty(xhr, 'statusText', { value: 'OK', writable: false, configurable: true });
                Object.defineProperty(xhr, 'responseType', { value: 'arraybuffer', writable: false, configurable: true });
                if (xhr.onload) xhr.onload();
                if (xhr.onreadystatechange) xhr.onreadystatechange();
              }
            })();
            
            // Override response property to return our tile data
            Object.defineProperty(xhr, 'response', {
              get: function() {
                if (tileDataBuffer !== null) {
                  return tileDataBuffer;
                }
                // Return empty buffer while loading (Mapbox will retry or wait)
                return new ArrayBuffer(0);
              },
              configurable: true
            });
            
            // Set responseType early
            Object.defineProperty(xhr, 'responseType', { 
              value: 'arraybuffer', 
              writable: false, 
              configurable: true 
            });
            
            return originalOpen.call(this, method, url, ...rest);
          }
        }
        
        return originalOpen.call(this, method, url, ...rest);
      };
      
      xhr.send = function(...args) {
        if (requestUrl && (requestUrl.includes('pmtiles') || requestUrl.includes('tile') || requestUrl.includes('proxy'))) {
          console.log('[WISER DEBUG] XMLHttpRequest.send for:', requestUrl);
        }
        
        // Don't actually send the request for proxy URLs - we handle it asynchronously
        if (requestUrl && requestUrl.includes('/pmtiles-proxy/')) {
          console.log('[WISER] Skipping actual XHR send for proxy URL, using async fetch instead');
          return; // Don't call originalSend
        }
        
        return originalSend.apply(this, args);
      };
      
      return xhr;
    };
    
    // Override fetch to intercept PMTiles tile requests
    window.fetch = async (input, init) => {
      // Extract URL from various input types
      let url;
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof Request) {
        url = input.url;
      } else if (input && input.url) {
        url = input.url;
      }
      
      // Debug: log ALL fetch calls to see what Mapbox is requesting
      if (url && (url.includes('pmtiles') || url.includes('tile') || url.includes('vector'))) {
        console.log('[WISER DEBUG] Fetch called:', url, 'type:', typeof input);
      }
      
      // Intercept our proxy URLs
      if (url && url.includes('/pmtiles-proxy/')) {
        console.log('[WISER] Intercepting PMTiles proxy request:', url);
        // Extract z/x/y from URL: /pmtiles-proxy/z/x/y
        const match = url.match(/\/pmtiles-proxy\/(\d+)\/(\d+)\/(\d+)/);
        if (match) {
          const [, z, x, y] = match;
          const tileKey = `${z}/${x}/${y}`;
          
          // Fetch tile from PMTiles using getZxy method directly
          try {
            const result = await pmtiles.getZxy(parseInt(z), parseInt(x), parseInt(y));
            
            if (result && result.data) {
              let tileData = result.data;
              
              // Check if data is compressed (gzip magic bytes: 0x1f 0x8b)
              const view = new Uint8Array(tileData);
              const isGzipped = view.length >= 2 && view[0] === 0x1f && view[1] === 0x8b;
              
              if (isGzipped) {
                console.log('[WISER] Tile data is compressed, decompressing...', tileKey);
                // Decompress using browser's DecompressionStream API
                try {
                  const stream = new DecompressionStream('gzip');
                  const writer = stream.writable.getWriter();
                  await writer.write(tileData);
                  await writer.close();
                  const decompressed = await new Response(stream.readable).arrayBuffer();
                  tileData = decompressed;
                  console.log('[WISER] Tile decompressed successfully', tileKey, 'size:', tileData.byteLength);
                } catch (decompressError) {
                  console.error('[WISER] Decompression failed:', decompressError);
                  return new Response(null, { status: 500 });
                }
              }
              
              // Sanity check: verify it's not HTML/error (starts with < or HTTP/)
              const firstBytes = new Uint8Array(tileData.slice(0, 10));
              const firstChars = String.fromCharCode(...firstBytes.slice(0, 5));
              if (firstChars.startsWith('<') || firstChars.startsWith('HTTP')) {
                console.error('[WISER] Tile data appears to be HTML/error, not MVT:', firstChars);
                return new Response(null, { status: 500 });
              }
              
              console.log('[WISER] PMTiles tile ready:', tileKey, 'size:', tileData.byteLength, 'first bytes:', Array.from(firstBytes.slice(0, 4)).map(b => '0x' + b.toString(16)).join(' '));
              
              // Return Response with decompressed MVT data
              return new Response(tileData, {
                status: 200,
                headers: {
                  'Content-Type': 'application/vnd.mapbox-vector-tile',
                },
              });
            } else {
              console.warn('[WISER] PMTiles tile not found or has no data:', tileKey);
              return new Response(null, { status: 404 });
            }
          } catch (error) {
            console.error('[WISER] PMTiles tile fetch error:', error);
            return new Response(null, { status: 404 });
          }
        }
      }
      
      // Default fetch behavior
      return originalFetch(input, init);
    };

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      projection: 'globe',
      center: [78.9629, 20.5937], // India centroid
      zoom: 3,
      pitch: 15,
      bearing: 0,
      attributionControl: true,
      transformRequest: (url, resourceType) => {
        // Debug: log all transformRequest calls
        if (resourceType === 'Tile') {
          console.log('[WISER DEBUG] transformRequest - Tile:', url, 'resourceType:', resourceType);
        }
        
        // Convert pmtiles-tile: URLs to HTTP proxy URLs that we can intercept
        if (resourceType === 'Tile' && url.includes('pmtiles-tile:')) {
          console.log('[WISER DEBUG] transformRequest intercepting pmtiles-tile URL:', url);
          // Convert: pmtiles-tile:z/x/y@/vectors/Raichur_CI.pmtiles
          // To: http://localhost:5173/pmtiles-proxy/z/x/y (absolute URL)
          const match = url.match(/pmtiles-tile:(\d+)\/(\d+)\/(\d+)@(.+)/);
          if (match) {
            const [, z, x, y] = match;
            // Use window.location.origin to make it an absolute URL
            const proxyUrl = `${window.location.origin}/pmtiles-proxy/${z}/${x}/${y}`;
            console.log('[WISER DEBUG] transformRequest converted to:', proxyUrl);
            return { url: proxyUrl };
          } else {
            console.warn('[WISER DEBUG] transformRequest pattern mismatch for:', url);
          }
        }
        return { url };
      },
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

    map.on('load', async () => {
      console.log('[WISER] map load');
      
      // Add PMTiles vector source after map loads
      // Use a custom URL pattern that transformRequest can intercept
      try {
        // Get PMTiles metadata to determine min/max zoom
        const header = await pmtiles.getHeader();
        console.log('[WISER] PMTiles header:', {
          tileType: header.tileType,
          minZoom: header.minZoom,
          maxZoom: header.maxZoom,
          tileCompression: header.tileCompression,
        });
        const minZoom = header.minZoom || 0;
        const maxZoom = header.maxZoom || 14;
        
        // Create a custom tile URL template that transformRequest will convert to proxy URLs
        // Format: pmtiles-tile:{z}/{x}/{y}@/vectors/Raichur_CI.pmtiles
        // transformRequest will convert this to /pmtiles-proxy/{z}/{x}/{y}
        const tileUrlTemplate = `pmtiles-tile:{z}/{x}/{y}@${pmtilesUrl}`;
        
        map.addSource('raichur-vector', {
          type: 'vector',
          tiles: [tileUrlTemplate],
          minzoom: minZoom,
          maxzoom: maxZoom,
        });
        console.log('[WISER] PMTiles source added', { minZoom, maxZoom });
        
        // Get the source-layer name from PMTiles metadata
        // PMTiles created from GeoJSON typically use the filename or "0" as layer name
        const metadata = await pmtiles.getMetadata();
        const sourceLayerName = metadata?.json?.vector_layers?.[0]?.id || 
                                metadata?.json?.name || 
                                'Raichur_CI';
        
        console.log('[WISER] Source layer name:', sourceLayerName);
        
        // Add a fill layer to display the vector polygons
        map.addLayer({
          id: 'raichur-fill',
          type: 'fill',
          source: 'raichur-vector',
          'source-layer': sourceLayerName,
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.3,
          },
        });
        
        // Add an outline layer for better visibility
        map.addLayer({
          id: 'raichur-outline',
          type: 'line',
          source: 'raichur-vector',
          'source-layer': sourceLayerName,
          paint: {
            'line-color': '#1e40af',
            'line-width': 2,
            'line-opacity': 0.8,
          },
        });
        
        console.log('[WISER] Vector layers added');
      } catch (error) {
        console.error('[WISER] Error adding PMTiles source:', error);
      }
    });
    
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
      // Restore original fetch and XMLHttpRequest
      if (window.fetch !== originalFetch) {
        window.fetch = originalFetch;
      }
      if (window.XMLHttpRequest !== OriginalXHR) {
        window.XMLHttpRequest = OriginalXHR;
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



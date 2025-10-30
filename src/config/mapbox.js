export function getMapboxToken() {
  const token = import.meta.env?.VITE_MAPBOX_TOKEN;
  if (typeof token === 'string' && token.trim().length > 0) {
    return token;
  }
  return null;
}

export function isMapboxTokenConfigured() {
  return getMapboxToken() !== null;
}


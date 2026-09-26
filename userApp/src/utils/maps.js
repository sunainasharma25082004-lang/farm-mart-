// utils/maps.js
// Helper functions for location handling in the Farmart tri‑app.
// Uses the Google Maps API key provided via environment variable.
// NOTE: Do NOT commit real API keys; they are accessed through
// process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY.

/**
 * Perform reverse geocoding using Google Geocoding API.
 * Returns an object containing a formatted address, city and postal code (pincode).
 *
 * @param {number} lat Latitude in decimal degrees.
 * @param {number} lng Longitude in decimal degrees.
 * @returns {Promise<{address:string, city:string, pincode:string}>}
 */
export async function reverseGeocode(lat, lng) {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn('Google Maps API key is missing');
    return { address: '', city: '', pincode: '' };
  }
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();
    if (data.status !== 'OK' || !data.results.length) {
      console.warn('Reverse geocode failed', data.status);
      return { address: '', city: '', pincode: '' };
    }
    const result = data.results[0];
    const address = result.formatted_address || '';
    let city = '';
    let pincode = '';
    // Parse address components for city and postal code.
    result.address_components.forEach(comp => {
      if (comp.types.includes('locality')) city = comp.long_name;
      if (comp.types.includes('postal_code')) pincode = comp.long_name;
    });
    return { address, city, pincode };
  } catch (e) {
    console.error('reverseGeocode error', e);
    return { address: '', city: '', pincode: '' };
  }
}

/**
 * Compute bearing (heading) from a previous point to a next point.
 * Returns bearing in degrees clockwise from true north.
 *
 * @param {{lat:number,lng:number}} prev
 * @param {{lat:number,lng:number}} next
 * @returns {number} Bearing in degrees (0‑360).
 */
export function computeBearing(prev, next) {
  const toRad = deg => (deg * Math.PI) / 180;
  const toDeg = rad => (rad * 180) / Math.PI;
  const lat1 = toRad(prev.lat);
  const lat2 = toRad(next.lat);
  const dLon = toRad(next.lng - prev.lng);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  let brng = toDeg(Math.atan2(y, x));
  brng = (brng + 360) % 360; // normalise
  return brng;
}

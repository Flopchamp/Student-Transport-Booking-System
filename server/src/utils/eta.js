/**
 * ETA Calculation Utility
 *
 * Calculates estimated time of arrival based on distance and speed.
 * Uses the Haversine formula for distance between two GPS coordinates.
 */

/**
 * Calculate the distance between two GPS coordinates using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in kilometers
 */
const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Calculate ETA in minutes from a vehicle's current position to a destination.
 * Takes into account current speed, or falls back to average speed.
 *
 * @param {object} params
 * @param {number} params.vehicleLat - Vehicle's current latitude
 * @param {number} params.vehicleLng - Vehicle's current longitude
 * @param {number} params.destLat - Destination latitude
 * @param {number} params.destLng - Destination longitude
 * @param {number} [params.currentSpeed] - Vehicle's current speed in km/h (0 = stationary)
 * @param {number} [params.averageSpeed=30] - Average speed assumption in km/h for urban school transport
 * @returns {{ distanceKm: number, etaMinutes: number, etaFormatted: string }}
 */
const calculateETA = ({ vehicleLat, vehicleLng, destLat, destLng, currentSpeed = 0, averageSpeed = 30 }) => {
  const distanceKm = haversineDistance(vehicleLat, vehicleLng, destLat, destLng);

  // Use current speed if vehicle is moving (> 5 km/h), else use average
  const effectiveSpeed = currentSpeed > 5 ? currentSpeed : averageSpeed;

  // ETA in minutes = (distance / speed) * 60
  // Add a 20% buffer for stops, traffic, etc.
  const rawMinutes = (distanceKm / effectiveSpeed) * 60;
  const etaMinutes = Math.round(rawMinutes * 1.2);

  // Format
  let etaFormatted;
  if (etaMinutes < 1) {
    etaFormatted = 'Arriving now';
  } else if (etaMinutes < 60) {
    etaFormatted = `${etaMinutes} min`;
  } else {
    const hrs = Math.floor(etaMinutes / 60);
    const mins = etaMinutes % 60;
    etaFormatted = mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }

  return {
    distanceKm: Math.round(distanceKm * 100) / 100,
    etaMinutes,
    etaFormatted,
  };
};

/**
 * Determine proximity status for arrival alerts.
 * @param {number} distanceKm - Distance to destination in km
 * @returns {'arrived' | 'approaching' | 'nearby' | 'en_route' | 'far'}
 */
const getProximityStatus = (distanceKm) => {
  if (distanceKm < 0.1) return 'arrived';         // < 100m
  if (distanceKm < 0.5) return 'approaching';     // < 500m
  if (distanceKm < 2) return 'nearby';            // < 2km
  if (distanceKm < 10) return 'en_route';         // < 10km
  return 'far';
};

module.exports = {
  haversineDistance,
  calculateETA,
  getProximityStatus,
};

import * as Astronomy from "astronomy-engine";

/**
 * Returns the geocentric apparent ecliptic longitude of a body in degrees [0, 360).
 * The Moon uses EclipticLongitude directly (inherently geocentric).
 * All other bodies use GeoVector → Ecliptic to get the apparent geocentric position,
 * which is required for retrograde detection, aspects, and ingress calculations.
 */
export function geocentricEclipticLon(body: Astronomy.Body, date: Date): number {
  if (body === Astronomy.Body.Sun) {
    // SunPosition returns apparent geocentric ecliptic coordinates
    const pos = Astronomy.SunPosition(date);
    return pos.elon;
  }

  // For the Moon and all planets: geocentric equatorial vector → ecliptic
  const geoVec = Astronomy.GeoVector(body, date, true);
  const ecliptic = Astronomy.Ecliptic(geoVec);
  return ((ecliptic.elon % 360) + 360) % 360;
}

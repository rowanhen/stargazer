import { ASTRONOMY_BODIES } from "../bodies.js";
import { geocentricEclipticLon } from "../geoLongitude.js";
import { literals } from "../literals.js";
import { longitudeToSign } from "../zodiac.js";
import type { Planet, RetrogradeStation } from "../types.js";

// Approximate orbital periods in days for sampling interval selection
const SCAN_INTERVAL: Record<Planet, number> = {
  Mercury: 2,
  Venus: 5,
  Mars: 5,
  Jupiter: 10,
  Saturn: 10,
  Uranus: 15,
  Neptune: 15,
  Pluto: 15,
};

// Apparent geocentric angular velocity in deg/day (positive = direct, negative = retrograde)
function angularVelocity(planet: Planet, date: Date): number {
  const body = ASTRONOMY_BODIES[planet];
  const dt = 0.5; // half a day
  const before = new Date(date.getTime() - dt * 24 * 60 * 60 * 1000);
  const after = new Date(date.getTime() + dt * 24 * 60 * 60 * 1000);
  const lon1 = geocentricEclipticLon(body, before);
  const lon2 = geocentricEclipticLon(body, after);

  // Unwrap longitude difference across the 0/360 boundary
  let diff = lon2 - lon1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  return diff / (2 * dt);
}

// Bisect to find the station (velocity sign change) between lo and hi
function findStation(
  planet: Planet,
  lo: Date,
  hi: Date,
  targetSign: "retrograde" | "direct",
  toleranceMs = 60 * 60 * 1000,
): Date {
  let loMs = lo.getTime();
  let hiMs = hi.getTime();

  while (hiMs - loMs > toleranceMs) {
    const mid = (loMs + hiMs) / 2;
    const midDate = new Date(mid);
    const v = angularVelocity(planet, midDate);

    if (targetSign === "retrograde") {
      // Looking for where v goes from > 0 to <= 0
      if (v > 0) {
        loMs = mid;
      } else {
        hiMs = mid;
      }
    } else {
      // Looking for where v goes from <= 0 to > 0
      if (v <= 0) {
        loMs = mid;
      } else {
        hiMs = mid;
      }
    }
  }

  return new Date((loMs + hiMs) / 2);
}

export function retrogradesInRange(
  planet: Planet,
  fromDate: Date,
  toDate: Date,
): RetrogradeStation[] {
  const stations: RetrogradeStation[] = [];
  const intervalMs = SCAN_INTERVAL[planet] * 24 * 60 * 60 * 1000;

  // Extend search window to catch retrogrades that overlap the boundary
  const searchFrom = new Date(fromDate.getTime() - 60 * 24 * 60 * 60 * 1000);
  const searchTo = new Date(toDate.getTime() + 60 * 24 * 60 * 60 * 1000);

  let cursor = searchFrom;
  let prevVelocity = angularVelocity(planet, cursor);
  let prevDate = cursor;

  let retroStart: Date | null = null;
  let retroStartLon = 0;

  cursor = new Date(cursor.getTime() + intervalMs);

  while (cursor <= searchTo) {
    const v = angularVelocity(planet, cursor);

    if (prevVelocity > 0 && v <= 0) {
      // Transition: direct → retrograde (station retrograde)
      const stationDate = findStation(planet, prevDate, cursor, "retrograde");
      retroStart = stationDate;
      retroStartLon = geocentricEclipticLon(ASTRONOMY_BODIES[planet], stationDate);
    } else if (prevVelocity <= 0 && v > 0 && retroStart !== null) {
      // Transition: retrograde → direct (station direct)
      const stationDate = findStation(planet, prevDate, cursor, "direct");
      const retroEndLon = geocentricEclipticLon(ASTRONOMY_BODIES[planet], stationDate);

      // Include if any part of the retrograde period overlaps the requested range
      const overlaps = retroStart <= toDate && stationDate >= fromDate;
      if (overlaps) {
        stations.push({
          planet,
          startDate: retroStart,
          endDate: stationDate,
          startSign: longitudeToSign(retroStartLon),
          endSign: longitudeToSign(retroEndLon),
          startLongitude: retroStartLon,
          endLongitude: retroEndLon,
        });
      }

      retroStart = null;
    }

    prevVelocity = v;
    prevDate = cursor;
    cursor = new Date(cursor.getTime() + intervalMs);
  }

  return stations.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
}

export const RETROGRADE_PLANETS = literals(
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
) satisfies ReadonlyArray<Planet>;

import { ASTRONOMY_BODIES } from "../bodies.js";
import { geocentricEclipticLon } from "../geoLongitude.js";
import { literals } from "../literals.js";
import type { AspectType, LuminousBody, PlanetaryAspect } from "../types.js";

const ASPECT_ANGLES: Record<AspectType, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

// Orb tolerance (degrees) for each aspect type
const ASPECT_ORBS: Record<AspectType, number> = {
  conjunction: 8,
  sextile: 5,
  square: 7,
  trine: 7,
  opposition: 8,
};

function geoLon(body: LuminousBody, date: Date): number {
  return geocentricEclipticLon(ASTRONOMY_BODIES[body], date);
}

// Minimum angular arc between two longitudes (0–180)
function angularSeparation(lon1: number, lon2: number): number {
  let diff = Math.abs(lon1 - lon2) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

// How many degrees the two bodies are from an exact aspect
function aspectDeviation(
  body1: LuminousBody,
  body2: LuminousBody,
  targetAngle: number,
  date: Date,
): number {
  const sep = angularSeparation(geoLon(body1, date), geoLon(body2, date));
  return Math.abs(sep - targetAngle);
}

// Ternary search for the local minimum deviation (exact aspect) in [lo, hi]
function refineAspect(
  body1: LuminousBody,
  body2: LuminousBody,
  targetAngle: number,
  lo: Date,
  hi: Date,
  toleranceMs = 30 * 60 * 1000,
): { date: Date; orb: number } {
  let loMs = lo.getTime();
  let hiMs = hi.getTime();

  while (hiMs - loMs > toleranceMs) {
    const m1 = loMs + (hiMs - loMs) / 3;
    const m2 = loMs + (2 * (hiMs - loMs)) / 3;
    const d1 = aspectDeviation(body1, body2, targetAngle, new Date(m1));
    const d2 = aspectDeviation(body1, body2, targetAngle, new Date(m2));

    if (d1 < d2) {
      hiMs = m2;
    } else {
      loMs = m1;
    }
  }

  const exactDate = new Date((loMs + hiMs) / 2);
  const orb = aspectDeviation(body1, body2, targetAngle, exactDate);
  return { date: exactDate, orb };
}

export function aspectsInRange(
  body1: LuminousBody,
  body2: LuminousBody,
  fromDate: Date,
  toDate: Date,
  aspectFilter?: AspectType,
): PlanetaryAspect[] {
  const events: PlanetaryAspect[] = [];
  const intervalMs = 24 * 60 * 60 * 1000; // 1-day sampling

  const aspectsToCheck = aspectFilter ? [aspectFilter] : ASPECT_TYPES;

  for (const aspect of aspectsToCheck) {
    const targetAngle = ASPECT_ANGLES[aspect];
    const orb = ASPECT_ORBS[aspect];

    let cursor = fromDate;
    let prevDev = aspectDeviation(body1, body2, targetAngle, cursor);
    let prevDate = cursor;

    cursor = new Date(cursor.getTime() + intervalMs);

    while (cursor <= toDate) {
      const dev = aspectDeviation(body1, body2, targetAngle, cursor);

      // Local minimum that falls within the orb = an aspect is perfecting
      if (prevDev < orb && prevDev <= dev) {
        const refined = refineAspect(body1, body2, targetAngle, prevDate, cursor);
        if (refined.orb < orb) {
          events.push({
            body1,
            body2,
            aspect,
            orb: Math.round(refined.orb * 100) / 100,
            date: refined.date,
          });
          // Skip forward to avoid re-detecting the same aspect
          cursor = new Date(cursor.getTime() + 10 * intervalMs);
          prevDev = aspectDeviation(body1, body2, targetAngle, cursor);
          prevDate = cursor;
          cursor = new Date(cursor.getTime() + intervalMs);
          continue;
        }
      }

      prevDev = dev;
      prevDate = cursor;
      cursor = new Date(cursor.getTime() + intervalMs);
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export const ALL_BODIES = literals(
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
) satisfies ReadonlyArray<LuminousBody>;

export const ASPECT_TYPES = literals(
  "conjunction",
  "sextile",
  "square",
  "trine",
  "opposition",
) satisfies ReadonlyArray<AspectType>;

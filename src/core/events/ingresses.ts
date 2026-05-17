import { ASTRONOMY_BODIES } from "../bodies.js";
import { geocentricEclipticLon } from "../geoLongitude.js";
import { literals } from "../literals.js";
import { longitudeToSign, SIGNS } from "../zodiac.js";
import type { LuminousBody, SignIngress, ZodiacSign } from "../types.js";

// Approximate sampling intervals in days (must be shorter than the
// time it takes a planet to traverse a single sign)
const SAMPLE_INTERVALS: Record<string, number> = {
  Moon: 0.5,
  Mercury: 3,
  Venus: 5,
  Sun: 5,
  Mars: 10,
  Jupiter: 30,
  Saturn: 60,
  Uranus: 120,
  Neptune: 180,
  Pluto: 180,
};

function getGeoLon(body: LuminousBody, date: Date): number {
  return geocentricEclipticLon(ASTRONOMY_BODIES[body], date);
}

// Binary search to find the exact ingress time at 1-minute resolution
function refineIngress(
  body: LuminousBody,
  beforeDate: Date,
  afterDate: Date,
  targetBoundaryDeg: number,
): Date {
  let lo = beforeDate.getTime();
  let hi = afterDate.getTime();

  while (hi - lo > 60 * 1000) {
    const mid = (lo + hi) / 2;
    const midDate = new Date(mid);
    const lon = getGeoLon(body, midDate);

    // Normalize relative to boundary: are we before or after it?
    const normalized = (lon - targetBoundaryDeg + 360) % 360;

    // normalized < 180 means we are just past the boundary (in the new sign)
    if (normalized < 180) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return new Date((lo + hi) / 2);
}

export function ingressesInRange(body: LuminousBody, fromDate: Date, toDate: Date): SignIngress[] {
  const events: SignIngress[] = [];
  const intervalMs = (SAMPLE_INTERVALS[body] ?? 10) * 24 * 60 * 60 * 1000;

  let cursor = fromDate;
  let prevLon = getGeoLon(body, cursor);
  let prevSign: ZodiacSign = longitudeToSign(prevLon);
  let prevDate: Date = cursor;

  cursor = new Date(cursor.getTime() + intervalMs);

  while (cursor <= toDate) {
    const lon = getGeoLon(body, cursor);
    const sign = longitudeToSign(lon);

    if (sign !== prevSign) {
      const prevSignIndex = SIGNS.indexOf(prevSign);
      const currSignIndex = SIGNS.indexOf(sign);

      // Determine the sign boundary that was crossed (handles retrograde too)
      let boundaryDeg: number;
      if (currSignIndex > prevSignIndex) {
        boundaryDeg = currSignIndex * 30;
      } else if (currSignIndex === 0 && prevSignIndex === 11) {
        // Pisces → Aries (direct)
        boundaryDeg = 0;
      } else {
        // Retrograde: moved back into the previous sign
        boundaryDeg = (currSignIndex + 1) * 30;
      }

      const exactDate = refineIngress(body, prevDate, cursor, boundaryDeg);

      if (exactDate >= fromDate && exactDate <= toDate) {
        events.push({
          planet: body,
          sign,
          prevSign,
          date: exactDate,
        });
      }
    }

    prevSign = sign;
    prevDate = cursor;
    cursor = new Date(cursor.getTime() + intervalMs);
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export const PLANETS_WITH_INGRESSES = literals(
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

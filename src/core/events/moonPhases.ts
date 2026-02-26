import * as Astronomy from "astronomy-engine";
import { geocentricEclipticLon } from "../geoLongitude.js";
import { longitudeToSign } from "../zodiac.js";
import type { MoonPhaseEvent, MoonPhaseName } from "../types.js";

const PHASE_TARGETS: { name: MoonPhaseName; longitude: number }[] = [
  { name: "New Moon", longitude: 0 },
  { name: "First Quarter", longitude: 90 },
  { name: "Full Moon", longitude: 180 },
  { name: "Last Quarter", longitude: 270 },
];

export function moonPhasesInRange(
  fromDate: Date,
  toDate: Date
): MoonPhaseEvent[] {
  const events: MoonPhaseEvent[] = [];

  // Search from slightly before the start to catch phases that fall exactly on fromDate
  const searchStart = new Date(fromDate.getTime() - 24 * 60 * 60 * 1000);
  const totalDays = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);

  for (const phase of PHASE_TARGETS) {
    let cursor = searchStart;
    const limitDays = Math.min(totalDays + 5, 30);

    while (cursor < toDate) {
      const result = Astronomy.SearchMoonPhase(
        phase.longitude,
        cursor,
        limitDays
      );

      if (!result) break;

      const eventDate = result.date;

      if (eventDate >= fromDate && eventDate <= toDate) {
        const longitude = geocentricEclipticLon(
          Astronomy.Body.Moon,
          result.date
        );
        events.push({
          name: phase.name,
          date: eventDate,
          longitude,
          sign: longitudeToSign(longitude),
        });
      }

      // Advance past this result by 28 days to find the next cycle
      cursor = new Date(result.date.getTime() + 28 * 24 * 60 * 60 * 1000);
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

import * as Astronomy from "astronomy-engine";
import type { EclipseEvent } from "../types.js";

export function eclipsesInRange(
  fromDate: Date,
  toDate: Date,
  type?: "solar" | "lunar"
): EclipseEvent[] {
  const events: EclipseEvent[] = [];

  if (!type || type === "lunar") {
    let cursor = fromDate;
    while (cursor < toDate) {
      const eclipse = Astronomy.SearchLunarEclipse(cursor);
      if (!eclipse || eclipse.peak.date > toDate) break;

      events.push({
        type: "lunar",
        kind: eclipse.kind,
        date: eclipse.peak.date,
        obscuration: eclipse.obscuration,
      });

      // Advance past this eclipse (~29 days to next lunar cycle)
      cursor = new Date(eclipse.peak.date.getTime() + 29 * 24 * 60 * 60 * 1000);
    }
  }

  if (!type || type === "solar") {
    let cursor = fromDate;
    while (cursor < toDate) {
      const eclipse = Astronomy.SearchGlobalSolarEclipse(cursor);
      if (!eclipse || eclipse.peak.date > toDate) break;

      events.push({
        type: "solar",
        kind: eclipse.kind,
        date: eclipse.peak.date,
        magnitude: eclipse.distance,
      });

      // Advance past this eclipse
      cursor = new Date(eclipse.peak.date.getTime() + 29 * 24 * 60 * 60 * 1000);
    }
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

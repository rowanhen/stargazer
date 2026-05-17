import { describe, test, expect } from "bun:test";
import { eclipsesInRange } from "../core/events/eclipses.js";
import { SOLAR_ECLIPSE_APR_2024, LUNAR_ECLIPSE_MAR_2025, RANGE_2024 } from "./fixtures.js";

describe("eclipsesInRange", () => {
  test("finds the total solar eclipse on 2024-04-08", () => {
    const from = new Date("2024-04-01");
    const to = new Date("2024-04-15");
    const events = eclipsesInRange(from, to, "solar");
    expect(events.length).toBeGreaterThanOrEqual(1);

    const eclipse = events[0];
    expect(eclipse.type).toBe("solar");
    const diffDays = Math.abs(
      (eclipse.date.getTime() - SOLAR_ECLIPSE_APR_2024.getTime()) / (1000 * 60 * 60 * 24),
    );
    expect(diffDays).toBeLessThan(2);
  });

  test("finds at least 2 solar eclipses in 2024", () => {
    const events = eclipsesInRange(RANGE_2024.from, RANGE_2024.to, "solar");
    expect(events.length).toBeGreaterThanOrEqual(2);
  });

  test("finds at least 2 lunar eclipses in 2024", () => {
    const events = eclipsesInRange(RANGE_2024.from, RANGE_2024.to, "lunar");
    expect(events.length).toBeGreaterThanOrEqual(2);
  });

  test("type filter works - solar only returns solar events", () => {
    const events = eclipsesInRange(RANGE_2024.from, RANGE_2024.to, "solar");
    for (const event of events) {
      expect(event.type).toBe("solar");
    }
  });

  test("type filter works - lunar only returns lunar events", () => {
    const events = eclipsesInRange(RANGE_2024.from, RANGE_2024.to, "lunar");
    for (const event of events) {
      expect(event.type).toBe("lunar");
    }
  });

  test("no filter returns both solar and lunar eclipses", () => {
    const events = eclipsesInRange(RANGE_2024.from, RANGE_2024.to);
    const types = new Set(events.map((e) => e.type));
    expect(types.has("solar")).toBe(true);
    expect(types.has("lunar")).toBe(true);
  });

  test("events are sorted by date", () => {
    const events = eclipsesInRange(RANGE_2024.from, RANGE_2024.to);
    for (let i = 1; i < events.length; i++) {
      expect(events[i].date.getTime()).toBeGreaterThanOrEqual(events[i - 1].date.getTime());
    }
  });

  test("finds the total lunar eclipse on 2025-03-14", () => {
    const from = new Date("2025-03-10");
    const to = new Date("2025-03-20");
    const events = eclipsesInRange(from, to, "lunar");
    expect(events.length).toBeGreaterThanOrEqual(1);

    const eclipse = events[0];
    const diffDays = Math.abs(
      (eclipse.date.getTime() - LUNAR_ECLIPSE_MAR_2025.getTime()) / (1000 * 60 * 60 * 24),
    );
    expect(diffDays).toBeLessThan(2);
  });

  test("returns empty array when no eclipses in range", () => {
    const from = new Date("2024-04-10");
    const to = new Date("2024-04-20");
    const events = eclipsesInRange(from, to);
    expect(events.length).toBe(0);
  });
});

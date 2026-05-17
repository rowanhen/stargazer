import { describe, test, expect } from "bun:test";
import { moonPhasesInRange } from "../core/events/moonPhases.js";
import { RANGE_JAN_2024, RANGE_2024 } from "./fixtures.js";

describe("moonPhasesInRange", () => {
  test("returns all four phases in January 2024", () => {
    const events = moonPhasesInRange(RANGE_JAN_2024.from, RANGE_JAN_2024.to);
    const names = events.map((e) => e.name);
    expect(names).toContain("New Moon");
    expect(names).toContain("First Quarter");
    expect(names).toContain("Full Moon");
    expect(names).toContain("Last Quarter");
  });

  test("returns events sorted by date", () => {
    const events = moonPhasesInRange(RANGE_JAN_2024.from, RANGE_JAN_2024.to);
    for (let i = 1; i < events.length; i++) {
      expect(events[i].date.getTime()).toBeGreaterThanOrEqual(events[i - 1].date.getTime());
    }
  });

  test("all events fall within the requested range", () => {
    const events = moonPhasesInRange(RANGE_JAN_2024.from, RANGE_JAN_2024.to);
    for (const event of events) {
      expect(event.date.getTime()).toBeGreaterThanOrEqual(RANGE_JAN_2024.from.getTime());
      expect(event.date.getTime()).toBeLessThanOrEqual(RANGE_JAN_2024.to.getTime());
    }
  });

  test("each event has a valid zodiac sign", () => {
    const VALID_SIGNS = [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ];
    const events = moonPhasesInRange(RANGE_JAN_2024.from, RANGE_JAN_2024.to);
    for (const event of events) {
      expect(VALID_SIGNS).toContain(event.sign);
    }
  });

  test("full year 2024 contains approximately 12-13 full moons", () => {
    const events = moonPhasesInRange(RANGE_2024.from, RANGE_2024.to);
    const fullMoons = events.filter((e) => e.name === "Full Moon");
    expect(fullMoons.length).toBeGreaterThanOrEqual(12);
    expect(fullMoons.length).toBeLessThanOrEqual(13);
  });

  test("full year 2024 contains approximately 12-13 new moons", () => {
    const events = moonPhasesInRange(RANGE_2024.from, RANGE_2024.to);
    const newMoons = events.filter((e) => e.name === "New Moon");
    expect(newMoons.length).toBeGreaterThanOrEqual(12);
    expect(newMoons.length).toBeLessThanOrEqual(13);
  });

  test("returns empty array for zero-length range", () => {
    const date = new Date("2024-01-15");
    const events = moonPhasesInRange(date, date);
    expect(events.length).toBe(0);
  });

  test("each event has a longitude between 0 and 360", () => {
    const events = moonPhasesInRange(RANGE_JAN_2024.from, RANGE_JAN_2024.to);
    for (const event of events) {
      expect(event.longitude).toBeGreaterThanOrEqual(0);
      expect(event.longitude).toBeLessThan(360);
    }
  });
});

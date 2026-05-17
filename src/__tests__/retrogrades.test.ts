import { describe, test, expect } from "bun:test";
import { retrogradesInRange } from "../core/events/retrogrades.js";
import { RANGE_2024, MERCURY_RETRO_2024 } from "./fixtures.js";

describe("retrogradesInRange", () => {
  test("finds Mercury retrograde periods in 2024", () => {
    const stations = retrogradesInRange("Mercury", RANGE_2024.from, RANGE_2024.to);
    // Mercury goes retrograde approximately 3 times per year
    expect(stations.length).toBeGreaterThanOrEqual(3);
    expect(stations.length).toBeLessThanOrEqual(4);
  });

  test("each station has startDate before endDate", () => {
    const stations = retrogradesInRange("Mercury", RANGE_2024.from, RANGE_2024.to);
    for (const station of stations) {
      expect(station.startDate.getTime()).toBeLessThan(station.endDate.getTime());
    }
  });

  test("Mercury retrograde April 2024 is detected", () => {
    const range = MERCURY_RETRO_2024[0];
    const searchFrom = new Date(range.start.getTime() - 10 * 24 * 60 * 60 * 1000);
    const searchTo = new Date(range.end.getTime() + 10 * 24 * 60 * 60 * 1000);
    const stations = retrogradesInRange("Mercury", searchFrom, searchTo);
    expect(stations.length).toBeGreaterThanOrEqual(1);

    // The station should start within 2 weeks of our known reference
    const aprilStation = stations[0];
    const diffDays = Math.abs(
      (aprilStation.startDate.getTime() - range.start.getTime()) / (1000 * 60 * 60 * 24),
    );
    expect(diffDays).toBeLessThan(14);
  });

  test("stations have valid zodiac signs", () => {
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
    const stations = retrogradesInRange("Mercury", RANGE_2024.from, RANGE_2024.to);
    for (const station of stations) {
      expect(VALID_SIGNS).toContain(station.startSign);
      expect(VALID_SIGNS).toContain(station.endSign);
    }
  });

  test("Jupiter retrograde in 2024 is detected", () => {
    const stations = retrogradesInRange("Jupiter", RANGE_2024.from, RANGE_2024.to);
    // Jupiter is retrograde roughly once a year for ~4 months
    expect(stations.length).toBeGreaterThanOrEqual(1);
  });

  test("stations are sorted by start date", () => {
    const stations = retrogradesInRange("Mercury", RANGE_2024.from, RANGE_2024.to);
    for (let i = 1; i < stations.length; i++) {
      expect(stations[i].startDate.getTime()).toBeGreaterThanOrEqual(
        stations[i - 1].startDate.getTime(),
      );
    }
  });
});

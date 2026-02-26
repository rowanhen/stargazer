// Well-known astrological events for test assertions

// Mercury retrograde periods in 2024
export const MERCURY_RETRO_2024 = [
  { start: new Date("2024-04-01"), end: new Date("2024-04-25") },
  { start: new Date("2024-08-05"), end: new Date("2024-08-28") },
  { start: new Date("2024-11-25"), end: new Date("2024-12-15") },
];

// Full moons in 2024 Q1 (approximate dates for range checks)
export const FULL_MOONS_2024_Q1 = [
  new Date("2024-01-25"),
  new Date("2024-02-24"),
  new Date("2024-03-25"),
];

// Total lunar eclipse 2025-03-14
export const LUNAR_ECLIPSE_MAR_2025 = new Date("2025-03-14");

// Solar eclipse 2024-04-08
export const SOLAR_ECLIPSE_APR_2024 = new Date("2024-04-08");

// Test range: all of 2024
export const RANGE_2024 = {
  from: new Date("2024-01-01"),
  to: new Date("2024-12-31"),
};

// Short range with known moon phases
export const RANGE_JAN_2024 = {
  from: new Date("2024-01-01"),
  to: new Date("2024-01-31"),
};

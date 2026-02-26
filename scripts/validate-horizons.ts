/**
 * Cross-validates geocentricEclipticLon() against JPL Horizons.
 *
 * Strategy
 * --------
 * Horizons EPHEM_TYPE=OBSERVER with QUANTITIES='31' returns the apparent
 * observer-centered ecliptic longitude in the ecliptic-of-date frame.
 *
 * Our geocentricEclipticLon() uses GeoVector(body, date, true) [with
 * light-time + aberration] then rotates to ecliptic using the J2000 mean
 * obliquity — effectively computing ecliptic-of-date apparent longitude.
 *
 * These two should agree to better than 0.01°.
 *
 * Note on reference frames
 * ------------------------
 * If you query Horizons EPHEM_TYPE=VECTORS you get J2000 ecliptic frame
 * coordinates (no precession). Our code produces ecliptic-of-date. The two
 * differ by the luni-solar precession since J2000.0 (~50.3 arcsec/yr × 24 yr
 * ≈ 0.33° for dates in 2024). That's a known frame difference, not a bug.
 */

import * as Astronomy from "astronomy-engine";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BODIES: {
  name: string;
  horizonsId: string;
  astroBody: Astronomy.Body;
}[] = [
  { name: "Mercury", horizonsId: "199", astroBody: Astronomy.Body.Mercury },
  { name: "Venus",   horizonsId: "299", astroBody: Astronomy.Body.Venus   },
  { name: "Mars",    horizonsId: "499", astroBody: Astronomy.Body.Mars    },
  { name: "Jupiter", horizonsId: "599", astroBody: Astronomy.Body.Jupiter },
  { name: "Saturn",  horizonsId: "699", astroBody: Astronomy.Body.Saturn  },
  { name: "Moon",    horizonsId: "301", astroBody: Astronomy.Body.Moon    },
];

const TEST_DATES = [
  "2024-01-01",
  "2024-04-08", // total solar eclipse
  "2024-07-01",
  "2024-10-01",
  "2024-12-31",
];

const PASS_THRESHOLD_DEG = 0.01;

// ---------------------------------------------------------------------------
// Horizons: OBSERVER apparent ecliptic longitude of date (QUANTITIES=31)
// ---------------------------------------------------------------------------

async function fetchHorizonsObserverLon(
  horizonsId: string,
  date: string
): Promise<number> {
  const stop = new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const params = new URLSearchParams({
    format: "text",
    COMMAND: horizonsId,
    OBJ_DATA: "NO",
    MAKE_EPHEM: "YES",
    EPHEM_TYPE: "OBSERVER",
    CENTER: "500@399",   // geocenter
    START_TIME: date,
    STOP_TIME: stop,
    STEP_SIZE: "1d",
    QUANTITIES: "31",    // observer-centered apparent ecliptic lon & lat (of date)
    APPARENT: "AIRLESS", // no atmospheric refraction
  });

  const url = `https://ssd.jpl.nasa.gov/api/horizons.api?${params}`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Horizons HTTP ${resp.status}`);
  const text = await resp.text();

  // Extract the data block between $$SOE and $$EOE
  const match = text.match(/\$\$SOE\s*([\s\S]*?)\s*\$\$EOE/);
  if (!match) {
    throw new Error(
      `No ephemeris block in Horizons response:\n${text.slice(0, 400)}`
    );
  }

  // OBSERVER output line format:
  //  2024-Jan-01 00:00     267.3083422  -0.5504977
  const line = match[1].trim().split("\n")[0];
  const parts = line.trim().split(/\s+/);
  // parts: [date, time, elon, elat]
  const elon = parseFloat(parts[2]);
  if (isNaN(elon)) {
    throw new Error(`Could not parse ecliptic longitude from line: "${line}"`);
  }
  return ((elon % 360) + 360) % 360;
}

// ---------------------------------------------------------------------------
// Our geocentricEclipticLon (apparent, matches ecliptic-of-date)
// ---------------------------------------------------------------------------

function ourApparentLon(body: Astronomy.Body, date: Date): number {
  if (body === Astronomy.Body.Sun) {
    const pos = Astronomy.SunPosition(date);
    return ((pos.elon % 360) + 360) % 360;
  }
  const geoVec = Astronomy.GeoVector(body, date, true);
  const ecl = Astronomy.Ecliptic(geoVec);
  return ((ecl.elon % 360) + 360) % 360;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function angularDiff(a: number, b: number): number {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

function fmt(n: number, decimals = 4): string {
  return n.toFixed(decimals);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const sep = "=".repeat(72);
  console.log(`\nJPL Horizons vs astronomy-engine — geocentric ecliptic longitude`);
  console.log(sep);
  console.log(`Horizons: OBSERVER, apparent, ecliptic-of-date (QUANTITIES=31)`);
  console.log(`Ours:     GeoVector(body, date, apparent=true) → Ecliptic().elon`);
  console.log(`Pass threshold: difference < ${PASS_THRESHOLD_DEG}°\n`);

  const header =
    "Body     ".padEnd(10) +
    "Date      ".padEnd(12) +
    "Horizons° ".padStart(12) +
    "Ours°     ".padStart(12) +
    "Diff°    ".padStart(10) +
    "  Pass";
  console.log(header);
  console.log("-".repeat(72));

  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  for (const body of BODIES) {
    for (const date of TEST_DATES) {
      let horizonsLon: number;
      try {
        horizonsLon = await fetchHorizonsObserverLon(body.horizonsId, date);
      } catch (err) {
        console.error(`  [FETCH ERROR] ${body.name} ${date}: ${err}`);
        failed++;
        continue;
      }

      const d = new Date(date + "T00:00:00Z");
      const ours = ourApparentLon(body.astroBody, d);
      const diff = angularDiff(horizonsLon, ours);
      const pass = diff < PASS_THRESHOLD_DEG;

      if (pass) {
        passed++;
      } else {
        failed++;
        failures.push(`${body.name} on ${date}: diff=${fmt(diff)}°`);
      }

      const tick = pass ? "✓" : "✗";
      console.log(
        body.name.padEnd(10) +
          date.padEnd(12) +
          fmt(horizonsLon, 4).padStart(12) +
          fmt(ours, 4).padStart(12) +
          fmt(diff, 5).padStart(10) +
          `  ${tick}`
      );

      // Be polite to the Horizons API
      await new Promise((r) => setTimeout(r, 300));
    }
    console.log();
  }

  console.log(sep);
  console.log(
    `Results: ${passed} passed, ${failed} failed out of ${passed + failed} checks`
  );

  if (failures.length > 0) {
    console.log("\nFailed checks:");
    for (const f of failures) console.log(`  ✗ ${f}`);
  }

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});

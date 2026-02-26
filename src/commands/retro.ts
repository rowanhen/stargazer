import { Command } from "commander";
import { retrogradesInRange, RETROGRADE_PLANETS } from "../core/events/retrogrades.js";
import type { CommonOptions, Planet } from "../core/types.js";

interface RetroOptions extends CommonOptions {
  planet?: string;
}

export const retroCommand = new Command("retro")
  .description("List retrograde stations in a time window")
  .option("-f, --from <iso>", "Start date (ISO format)")
  .option("-T, --to <iso>", "End date (ISO format)")
  .option(
    "-p, --planet <name>",
    `Planet to filter by. One of: ${RETROGRADE_PLANETS.join(", ")}`
  )
  .option("-j, --json", "Output as JSON", false)
  .action(async (options: RetroOptions) => {
    const { from, to, json } = options;

    if (!from || !to) {
      console.error("Error: --from and --to are required");
      process.exit(1);
    }

    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      console.error("Error: Invalid date format. Use ISO format (e.g., 2024-01-01)");
      process.exit(1);
    }

    const planetFilter = options.planet as Planet | undefined;
    if (planetFilter && !RETROGRADE_PLANETS.includes(planetFilter)) {
      console.error(
        `Error: Unknown planet '${planetFilter}'. Choose from: ${RETROGRADE_PLANETS.join(", ")}`
      );
      process.exit(1);
    }

    const planets: Planet[] = planetFilter ? [planetFilter] : RETROGRADE_PLANETS;
    const all = planets.flatMap((p) => retrogradesInRange(p, fromDate, toDate));
    all.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    if (json) {
      console.log(
        JSON.stringify(
          all.map((e) => ({
            ...e,
            startDate: e.startDate.toISOString(),
            endDate: e.endDate.toISOString(),
          })),
          null,
          2
        )
      );
      return;
    }

    if (all.length === 0) {
      console.log("No retrograde periods found in this window.");
      return;
    }

    console.log("\nRetrograde Periods");
    console.log("─".repeat(72));
    console.log(`Planet:  ${planetFilter ?? "all"}`);
    console.log(`Period:  ${from} → ${to}`);
    console.log("─".repeat(72));

    for (const station of all) {
      const start = station.startDate.toISOString().slice(0, 10);
      const end = station.endDate.toISOString().slice(0, 10);
      const durationDays = Math.round(
        (station.endDate.getTime() - station.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const planet = station.planet.padEnd(9);
      const signs =
        station.startSign === station.endSign
          ? station.startSign
          : `${station.startSign} → ${station.endSign}`;
      console.log(
        `Rx ${planet}  ${start} – ${end}   ${durationDays}d   ${signs}`
      );
    }

    console.log("─".repeat(72));
    console.log(`Total: ${all.length} retrograde period(s)`);
  });

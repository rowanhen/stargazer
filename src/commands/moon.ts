import { Command } from "commander";
import { moonPhasesInRange } from "../core/events/moonPhases.js";
import type { CommonOptions } from "../core/types.js";

export const moonCommand = new Command("moon")
  .description("List moon phases in a time window")
  .option("-f, --from <iso>", "Start date (ISO format)")
  .option("-T, --to <iso>", "End date (ISO format)")
  .option("-j, --json", "Output as JSON", false)
  .action(async (options: CommonOptions) => {
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

    const events = moonPhasesInRange(fromDate, toDate);

    if (json) {
      console.log(
        JSON.stringify(
          events.map((e) => ({
            ...e,
            date: e.date.toISOString(),
            longitude: Math.round(e.longitude * 100) / 100,
          })),
          null,
          2
        )
      );
      return;
    }

    if (events.length === 0) {
      console.log("No moon phases found in this period.");
      return;
    }

    console.log("\nMoon Phases");
    console.log("─".repeat(52));
    console.log(`Period: ${from} → ${to}`);
    console.log("─".repeat(52));

    for (const event of events) {
      const symbol = phaseSymbol(event.name);
      const dateStr = event.date.toISOString().replace("T", " ").slice(0, 16) + " UTC";
      const lonStr = event.longitude.toFixed(1).padStart(6);
      console.log(
        `${symbol} ${event.name.padEnd(14)} ${dateStr}   ${lonStr}° ${event.sign}`
      );
    }

    console.log("─".repeat(52));
    console.log(`Total: ${events.length} phases`);
  });

function phaseSymbol(name: string): string {
  switch (name) {
    case "New Moon":
      return "●";
    case "First Quarter":
      return "◑";
    case "Full Moon":
      return "○";
    case "Last Quarter":
      return "◐";
    default:
      return " ";
  }
}

import { Command } from "commander";
import { eclipsesInRange } from "../core/events/eclipses.js";
import type { CommonOptions } from "../core/types.js";

interface EclipseOptions extends CommonOptions {
  type?: string;
}

export const eclipseCommand = new Command("eclipse")
  .description("List solar and lunar eclipses in a time window")
  .option("-f, --from <iso>", "Start date (ISO format)")
  .option("-T, --to <iso>", "End date (ISO format)")
  .option("-t, --type <solar|lunar>", "Filter by eclipse type: solar, lunar")
  .option("-j, --json", "Output as JSON", false)
  .action(async (options: EclipseOptions) => {
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

    const typeFilter = options.type as "solar" | "lunar" | undefined;
    if (typeFilter && typeFilter !== "solar" && typeFilter !== "lunar") {
      console.error("Error: --type must be 'solar' or 'lunar'");
      process.exit(1);
    }

    const events = eclipsesInRange(fromDate, toDate, typeFilter);

    if (json) {
      console.log(
        JSON.stringify(
          events.map((e) => ({ ...e, date: e.date.toISOString() })),
          null,
          2
        )
      );
      return;
    }

    if (events.length === 0) {
      console.log("No eclipses found in this period.");
      return;
    }

    console.log("\nEclipses");
    console.log("─".repeat(58));
    console.log(`Type:    ${typeFilter ?? "solar + lunar"}`);
    console.log(`Period:  ${from} → ${to}`);
    console.log("─".repeat(58));

    for (const event of events) {
      const symbol = event.type === "solar" ? "☀" : "☽";
      const dateStr = event.date.toISOString().replace("T", " ").slice(0, 16) + " UTC";
      const kind = event.kind.padEnd(10);
      const extra =
        event.type === "lunar" && event.obscuration !== undefined
          ? `obscuration ${(event.obscuration * 100).toFixed(1)}%`
          : "";
      console.log(`${symbol} ${event.type.padEnd(5)} ${kind}  ${dateStr}   ${extra}`);
    }

    console.log("─".repeat(58));
    console.log(`Total: ${events.length} eclipse(s)`);
  });

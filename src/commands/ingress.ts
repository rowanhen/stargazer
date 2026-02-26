import { Command } from "commander";
import {
  ingressesInRange,
  PLANETS_WITH_INGRESSES,
} from "../core/events/ingresses.js";
import type { CommonOptions, LuminousBody } from "../core/types.js";

interface IngressOptions extends CommonOptions {
  planet?: string;
}

export const ingressCommand = new Command("ingress")
  .description("List planetary sign ingresses in a time window")
  .option("-f, --from <iso>", "Start date (ISO format)")
  .option("-T, --to <iso>", "End date (ISO format)")
  .option(
    "-p, --planet <name>",
    `Planet to filter by. One of: ${PLANETS_WITH_INGRESSES.join(", ")}`
  )
  .option("-j, --json", "Output as JSON", false)
  .action(async (options: IngressOptions) => {
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

    const planetFilter = options.planet as LuminousBody | undefined;
    if (planetFilter && !PLANETS_WITH_INGRESSES.includes(planetFilter)) {
      console.error(
        `Error: Unknown planet '${planetFilter}'. Choose from: ${PLANETS_WITH_INGRESSES.join(", ")}`
      );
      process.exit(1);
    }

    const bodies: LuminousBody[] = planetFilter
      ? [planetFilter]
      : PLANETS_WITH_INGRESSES;

    const all = (
      await Promise.all(bodies.map((b) => ingressesInRange(b, fromDate, toDate)))
    ).flat();

    all.sort((a, b) => a.date.getTime() - b.date.getTime());

    if (json) {
      console.log(
        JSON.stringify(
          all.map((e) => ({ ...e, date: e.date.toISOString() })),
          null,
          2
        )
      );
      return;
    }

    if (all.length === 0) {
      console.log("No ingresses found in this period.");
      return;
    }

    console.log("\nPlanetary Ingresses");
    console.log("─".repeat(58));
    console.log(`Planet:  ${planetFilter ?? "all"}`);
    console.log(`Period:  ${from} → ${to}`);
    console.log("─".repeat(58));

    for (const event of all) {
      const dateStr = event.date.toISOString().replace("T", " ").slice(0, 16) + " UTC";
      const planet = event.planet.padEnd(9);
      const arrow = `${event.prevSign} → ${event.sign}`;
      console.log(`${dateStr}   ${planet}  ${arrow}`);
    }

    console.log("─".repeat(58));
    console.log(`Total: ${all.length} ingresses`);
  });

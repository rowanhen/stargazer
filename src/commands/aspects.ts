import { Command } from "commander";
import {
  aspectsInRange,
  ALL_BODIES,
  ASPECT_TYPES,
} from "../core/events/aspects.js";
import type { AspectType, CommonOptions, LuminousBody } from "../core/types.js";

interface AspectsOptions extends CommonOptions {
  body1?: string;
  body2?: string;
  aspect?: string;
}

export const aspectsCommand = new Command("aspects")
  .description("Find planetary aspects in a time window")
  .option("-f, --from <iso>", "Start date (ISO format)")
  .option("-T, --to <iso>", "End date (ISO format)")
  .option(
    "-b, --body1 <name>",
    `First body (default: Sun). One of: ${ALL_BODIES.join(", ")}`
  )
  .option(
    "-B, --body2 <name>",
    `Second body (default: Moon). One of: ${ALL_BODIES.join(", ")}`
  )
  .option(
    "-a, --aspect <type>",
    `Filter by aspect type: ${ASPECT_TYPES.join(", ")}`
  )
  .option("-j, --json", "Output as JSON", false)
  .action(async (options: AspectsOptions) => {
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

    const body1: LuminousBody = (options.body1 as LuminousBody) ?? "Sun";
    const body2: LuminousBody = (options.body2 as LuminousBody) ?? "Moon";

    if (!ALL_BODIES.includes(body1)) {
      console.error(`Error: Unknown body '${body1}'. Choose from: ${ALL_BODIES.join(", ")}`);
      process.exit(1);
    }
    if (!ALL_BODIES.includes(body2)) {
      console.error(`Error: Unknown body '${body2}'. Choose from: ${ALL_BODIES.join(", ")}`);
      process.exit(1);
    }
    if (body1 === body2) {
      console.error("Error: --body1 and --body2 must be different bodies");
      process.exit(1);
    }

    const aspectFilter = options.aspect as AspectType | undefined;
    if (aspectFilter && !ASPECT_TYPES.includes(aspectFilter)) {
      console.error(`Error: Unknown aspect '${aspectFilter}'. Choose from: ${ASPECT_TYPES.join(", ")}`);
      process.exit(1);
    }

    const events = aspectsInRange(body1, body2, fromDate, toDate, aspectFilter);

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
      console.log("No aspects found in this period.");
      return;
    }

    console.log("\nPlanetary Aspects");
    console.log("─".repeat(60));
    console.log(`Bodies:  ${body1} / ${body2}`);
    console.log(`Aspect:  ${aspectFilter ?? "all"}`);
    console.log(`Period:  ${from} → ${to}`);
    console.log("─".repeat(60));

    for (const event of events) {
      const dateStr = event.date.toISOString().replace("T", " ").slice(0, 16) + " UTC";
      const aspectPad = event.aspect.padEnd(11);
      const orbStr = `orb ${event.orb.toFixed(1)}°`;
      console.log(`${dateStr}   ${aspectPad}  ${body1} / ${body2}   ${orbStr}`);
    }

    console.log("─".repeat(60));
    console.log(`Total: ${events.length} aspects`);
  });

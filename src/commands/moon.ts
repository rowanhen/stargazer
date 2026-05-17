import { Command } from "@effect/cli";
import { Console, Effect } from "effect";
import { moonPhasesInRange } from "../core/events/moonPhases.js";
import {
  formatPeriodDate,
  formatUtc,
  fromOption,
  jsonOption,
  printJson,
  toOption,
} from "./shared.js";

export const moonCommand = Command.make(
  "moon",
  { from: fromOption, to: toOption, json: jsonOption },
  ({ from, json, to }) =>
    Effect.gen(function* () {
      const events = moonPhasesInRange(from, to);

      if (json) {
        yield* printJson(
          events.map((event) => ({
            ...event,
            date: event.date.toISOString(),
            longitude: Math.round(event.longitude * 100) / 100,
          })),
        );
        return;
      }

      if (events.length === 0) {
        yield* Console.log("No moon phases found in this period.");
        return;
      }

      yield* Console.log("\nMoon Phases");
      yield* Console.log("─".repeat(52));
      yield* Console.log(`Period: ${formatPeriodDate(from)} → ${formatPeriodDate(to)}`);
      yield* Console.log("─".repeat(52));

      for (const event of events) {
        const symbol = phaseSymbol(event.name);
        const lonStr = event.longitude.toFixed(1).padStart(6);
        yield* Console.log(
          `${symbol} ${event.name.padEnd(14)} ${formatUtc(event.date)}   ${lonStr}° ${event.sign}`,
        );
      }

      yield* Console.log("─".repeat(52));
      yield* Console.log(`Total: ${events.length} phases`);
    }),
).pipe(Command.withDescription("List moon phases in a time window"));

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

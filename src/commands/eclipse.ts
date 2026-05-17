import { Command, Options } from "@effect/cli";
import { Console, Effect, Option } from "effect";
import { eclipsesInRange } from "../core/events/eclipses.js";
import type { EclipseEvent } from "../core/types.js";
import { literals } from "../core/literals.js";
import { formatUtc, fromOption, jsonOption, printJson, toOption } from "./shared.js";

const ECLIPSE_TYPES = literals("solar", "lunar") satisfies ReadonlyArray<EclipseEvent["type"]>;

const typeOption = Options.choice("type", ECLIPSE_TYPES).pipe(
  Options.withAlias("t"),
  Options.withDescription("Filter by eclipse type: solar, lunar"),
  Options.optional,
);

export const eclipseCommand = Command.make(
  "eclipse",
  { from: fromOption, to: toOption, type: typeOption, json: jsonOption },
  ({ from, json, to, type }) =>
    Effect.gen(function* () {
      const typeFilter = Option.getOrUndefined(type);
      const events = eclipsesInRange(from, to, typeFilter);

      if (json) {
        yield* printJson(events.map((event) => ({ ...event, date: event.date.toISOString() })));
        return;
      }

      if (events.length === 0) {
        yield* Console.log("No eclipses found in this period.");
        return;
      }

      yield* Console.log("\nEclipses");
      yield* Console.log("─".repeat(58));
      yield* Console.log(`Type:    ${typeFilter ?? "solar + lunar"}`);
      yield* Console.log(`Period:  ${from} → ${to}`);
      yield* Console.log("─".repeat(58));

      for (const event of events) {
        const symbol = event.type === "solar" ? "☀" : "☽";
        const kind = event.kind.padEnd(10);
        const extra =
          event.type === "lunar" && event.obscuration !== undefined
            ? `obscuration ${(event.obscuration * 100).toFixed(1)}%`
            : "";
        yield* Console.log(
          `${symbol} ${event.type.padEnd(5)} ${kind}  ${formatUtc(event.date)}   ${extra}`,
        );
      }

      yield* Console.log("─".repeat(58));
      yield* Console.log(`Total: ${events.length} eclipse(s)`);
    }),
).pipe(Command.withDescription("List solar and lunar eclipses in a time window"));

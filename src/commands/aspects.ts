import { Command, Options } from "@effect/cli";
import { Console, Effect, Option } from "effect";
import { ALL_BODIES, ASPECT_TYPES, aspectsInRange } from "../core/events/aspects.js";
import {
  formatPeriodDate,
  formatUtc,
  fromOption,
  jsonOption,
  printJson,
  toOption,
} from "./shared.js";

const body1Option = Options.choice("body1", ALL_BODIES).pipe(
  Options.withAlias("b"),
  Options.withDescription(`First body (default: Sun). One of: ${ALL_BODIES.join(", ")}`),
  Options.withDefault("Sun"),
);

const body2Option = Options.choice("body2", ALL_BODIES).pipe(
  Options.withAlias("B"),
  Options.withDescription(`Second body (default: Moon). One of: ${ALL_BODIES.join(", ")}`),
  Options.withDefault("Moon"),
);

const aspectOption = Options.choice("aspect", ASPECT_TYPES).pipe(
  Options.withAlias("a"),
  Options.withDescription(`Filter by aspect type: ${ASPECT_TYPES.join(", ")}`),
  Options.optional,
);

export const aspectsCommand = Command.make(
  "aspects",
  {
    from: fromOption,
    to: toOption,
    body1: body1Option,
    body2: body2Option,
    aspect: aspectOption,
    json: jsonOption,
  },
  ({ aspect, body1, body2, from, json, to }) =>
    Effect.gen(function* () {
      if (body1 === body2) {
        process.exitCode = 1;
        yield* Console.error("Error: --body1 and --body2 must be different bodies");
        return;
      }

      const aspectFilter = Option.getOrUndefined(aspect);
      const events = aspectsInRange(body1, body2, from, to, aspectFilter);

      if (json) {
        yield* printJson(events.map((event) => ({ ...event, date: event.date.toISOString() })));
        return;
      }

      if (events.length === 0) {
        yield* Console.log("No aspects found in this period.");
        return;
      }

      yield* Console.log("\nPlanetary Aspects");
      yield* Console.log("─".repeat(60));
      yield* Console.log(`Bodies:  ${body1} / ${body2}`);
      yield* Console.log(`Aspect:  ${aspectFilter ?? "all"}`);
      yield* Console.log(`Period:  ${formatPeriodDate(from)} → ${formatPeriodDate(to)}`);
      yield* Console.log("─".repeat(60));

      for (const event of events) {
        const aspectPad = event.aspect.padEnd(11);
        const orbStr = `orb ${event.orb.toFixed(1)}°`;
        yield* Console.log(
          `${formatUtc(event.date)}   ${aspectPad}  ${body1} / ${body2}   ${orbStr}`,
        );
      }

      yield* Console.log("─".repeat(60));
      yield* Console.log(`Total: ${events.length} aspects`);
    }),
).pipe(Command.withDescription("Find planetary aspects in a time window"));

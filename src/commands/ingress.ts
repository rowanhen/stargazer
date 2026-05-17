import { Command, Options } from "@effect/cli";
import { Console, Effect, Option } from "effect";
import { PLANETS_WITH_INGRESSES, ingressesInRange } from "../core/events/ingresses.js";
import {
  formatPeriodDate,
  formatUtc,
  fromOption,
  jsonOption,
  printJson,
  toOption,
} from "./shared.js";

const planetOption = Options.choice("planet", PLANETS_WITH_INGRESSES).pipe(
  Options.withAlias("p"),
  Options.withDescription(`Planet to filter by. One of: ${PLANETS_WITH_INGRESSES.join(", ")}`),
  Options.optional,
);

export const ingressCommand = Command.make(
  "ingress",
  { from: fromOption, to: toOption, planet: planetOption, json: jsonOption },
  ({ from, json, planet, to }) =>
    Effect.gen(function* () {
      const planetFilter = Option.getOrUndefined(planet);
      const bodies = planetFilter ? [planetFilter] : PLANETS_WITH_INGRESSES;
      const all = bodies.flatMap((body) => ingressesInRange(body, from, to));
      all.sort((a, b) => a.date.getTime() - b.date.getTime());

      if (json) {
        yield* printJson(all.map((event) => ({ ...event, date: event.date.toISOString() })));
        return;
      }

      if (all.length === 0) {
        yield* Console.log("No ingresses found in this period.");
        return;
      }

      yield* Console.log("\nPlanetary Ingresses");
      yield* Console.log("─".repeat(58));
      yield* Console.log(`Planet:  ${planetFilter ?? "all"}`);
      yield* Console.log(`Period:  ${formatPeriodDate(from)} → ${formatPeriodDate(to)}`);
      yield* Console.log("─".repeat(58));

      for (const event of all) {
        const planetName = event.planet.padEnd(9);
        const arrow = `${event.prevSign} → ${event.sign}`;
        yield* Console.log(`${formatUtc(event.date)}   ${planetName}  ${arrow}`);
      }

      yield* Console.log("─".repeat(58));
      yield* Console.log(`Total: ${all.length} ingresses`);
    }),
).pipe(Command.withDescription("List planetary sign ingresses in a time window"));

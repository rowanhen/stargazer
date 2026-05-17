import { Command, Options } from "@effect/cli";
import { Console, Effect, Option } from "effect";
import { RETROGRADE_PLANETS, retrogradesInRange } from "../core/events/retrogrades.js";
import { formatPeriodDate, fromOption, jsonOption, printJson, toOption } from "./shared.js";

const planetOption = Options.choice("planet", RETROGRADE_PLANETS).pipe(
  Options.withAlias("p"),
  Options.withDescription(`Planet to filter by. One of: ${RETROGRADE_PLANETS.join(", ")}`),
  Options.optional,
);

export const retroCommand = Command.make(
  "retro",
  { from: fromOption, to: toOption, planet: planetOption, json: jsonOption },
  ({ from, json, planet, to }) =>
    Effect.gen(function* () {
      const planetFilter = Option.getOrUndefined(planet);
      const planets = planetFilter ? [planetFilter] : RETROGRADE_PLANETS;
      const all = planets.flatMap((body) => retrogradesInRange(body, from, to));
      all.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      if (json) {
        yield* printJson(
          all.map((event) => ({
            ...event,
            startDate: event.startDate.toISOString(),
            endDate: event.endDate.toISOString(),
          })),
        );
        return;
      }

      if (all.length === 0) {
        yield* Console.log("No retrograde periods found in this window.");
        return;
      }

      yield* Console.log("\nRetrograde Periods");
      yield* Console.log("─".repeat(72));
      yield* Console.log(`Planet:  ${planetFilter ?? "all"}`);
      yield* Console.log(`Period:  ${formatPeriodDate(from)} → ${formatPeriodDate(to)}`);
      yield* Console.log("─".repeat(72));

      for (const station of all) {
        const start = station.startDate.toISOString().slice(0, 10);
        const end = station.endDate.toISOString().slice(0, 10);
        const durationDays = Math.round(
          (station.endDate.getTime() - station.startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const planetName = station.planet.padEnd(9);
        const signs =
          station.startSign === station.endSign
            ? station.startSign
            : `${station.startSign} → ${station.endSign}`;
        yield* Console.log(`Rx ${planetName}  ${start} – ${end}   ${durationDays}d   ${signs}`);
      }

      yield* Console.log("─".repeat(72));
      yield* Console.log(`Total: ${all.length} retrograde period(s)`);
    }),
).pipe(Command.withDescription("List retrograde stations in a time window"));

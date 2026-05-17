import { Options } from "@effect/cli";
import { Console } from "effect";

export const fromOption = Options.date("from").pipe(
  Options.withAlias("f"),
  Options.withDescription("Start date (ISO format)"),
);

export const toOption = Options.date("to").pipe(
  Options.withAlias("T"),
  Options.withDescription("End date (ISO format)"),
);

export const jsonOption = Options.boolean("json").pipe(
  Options.withAlias("j"),
  Options.withDescription("Output as JSON"),
);

export function printJson(value: unknown) {
  return Console.log(JSON.stringify(value, null, 2));
}

export function formatUtc(date: Date): string {
  return date.toISOString().replace("T", " ").slice(0, 16) + " UTC";
}

export function formatPeriodDate(date: Date): string {
  const iso = date.toISOString();
  return iso.endsWith("T00:00:00.000Z") ? iso.slice(0, 10) : iso;
}

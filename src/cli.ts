#!/usr/bin/env node

import { Command, HelpDoc, ValidationError } from "@effect/cli";
import { BunContext, BunRuntime } from "@effect/platform-bun";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Console, Effect } from "effect";
import { aspectsCommand } from "./commands/aspects.js";
import { eclipseCommand } from "./commands/eclipse.js";
import { ingressCommand } from "./commands/ingress.js";
import { moonCommand } from "./commands/moon.js";
import { retroCommand } from "./commands/retro.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf-8"));

const command = Command.make("stargazer").pipe(
  Command.withDescription("CLI tool for querying astrological events during time periods"),
  Command.withSubcommands([
    moonCommand,
    aspectsCommand,
    ingressCommand,
    retroCommand,
    eclipseCommand,
  ]),
);

const runCli = Command.run(command, {
  name: "stargazer",
  version: pkg.version,
})(process.argv);

const program = Console.consoleWith((console) =>
  runCli.pipe(
    Console.withConsole({
      ...console,
      error: () => Effect.void,
    }),
    Effect.catchAll((error) => renderCliError(error)),
  ),
);

program.pipe(Effect.provide(BunContext.layer), BunRuntime.runMain);

function renderCliError(error: unknown) {
  process.exitCode = 1;

  if (ValidationError.isValidationError(error)) {
    return Console.error(`Error: ${formatValidationError(error)}`);
  }

  return Console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
}

function formatValidationError(error: ValidationError.ValidationError): string {
  const detail = collapse(HelpDoc.toAnsiText(error.error));

  if (
    ValidationError.isMissingValue(error) &&
    detail.includes("'--from'") &&
    detail.includes("'--to'")
  ) {
    return "--from and --to are required";
  }

  return detail;
}

function collapse(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { moonCommand } from "./commands/moon.js";
import { aspectsCommand } from "./commands/aspects.js";
import { ingressCommand } from "./commands/ingress.js";
import { retroCommand } from "./commands/retro.js";
import { eclipseCommand } from "./commands/eclipse.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(
  readFileSync(join(__dirname, "..", "package.json"), "utf-8")
);

const program = new Command();

program
  .name("stargazer")
  .description("CLI tool for querying astrological events during time periods")
  .version(pkg.version);

program.addCommand(moonCommand);
program.addCommand(aspectsCommand);
program.addCommand(ingressCommand);
program.addCommand(retroCommand);
program.addCommand(eclipseCommand);

program.parse();

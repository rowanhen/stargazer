# @shepherd-terminal/stargazer

CLI tool for querying astrological events during time periods — moon phases, planetary aspects, sign ingresses, retrograde stations, and eclipses.

All calculations are performed locally using [astronomy-engine](https://github.com/cosinekitty/astronomy). No API key or network access required.

## Installation

```bash
npm install -g @shepherd-terminal/stargazer
```

Or use without installing:

```bash
npx @shepherd-terminal/stargazer moon --from 2024-01-01 --to 2024-03-31
```

## Commands

### `moon` — Moon Phases

List all moon phases (new, first quarter, full, last quarter) in a time window.

```bash
stargazer moon --from 2024-01-01 --to 2024-03-31
```

```
Moon Phases
────────────────────────────────────────────────────
Period: 2024-01-01 → 2024-03-31
────────────────────────────────────────────────────
◐ Last Quarter    2024-01-04 03:30 UTC     283.2° Capricorn
● New Moon        2024-01-11 11:57 UTC      20.4° Capricorn
◑ First Quarter   2024-01-18 03:52 UTC     117.5° Cancer
○ Full Moon       2024-01-25 17:54 UTC     125.2° Leo
...
────────────────────────────────────────────────────
Total: 13 phases
```

### `aspects` — Planetary Aspects

Find aspects (conjunction, sextile, square, trine, opposition) between two bodies.

```bash
stargazer aspects --from 2024-01-01 --to 2024-06-01 --body1 Sun --body2 Saturn
stargazer aspects --from 2024-01-01 --to 2024-06-01 --body1 Mars --body2 Jupiter --aspect trine
```

**Options:**

| Flag | Description | Default |
|------|-------------|---------|
| `-b, --body1 <name>` | First body | `Sun` |
| `-B, --body2 <name>` | Second body | `Moon` |
| `-a, --aspect <type>` | Filter by aspect type | all |

Bodies: `Sun Moon Mercury Venus Mars Jupiter Saturn Uranus Neptune Pluto`

Aspect types: `conjunction sextile square trine opposition`

### `ingress` — Sign Ingresses

List when planets move into new zodiac signs.

```bash
stargazer ingress --from 2024-01-01 --to 2024-12-31
stargazer ingress --from 2024-01-01 --to 2024-12-31 --planet Mars
```

```
Planetary Ingresses
──────────────────────────────────────────────────────────
Planet:  Mars
Period:  2024-01-01 → 2024-12-31
──────────────────────────────────────────────────────────
2024-01-04 19:58 UTC   Mars       Capricorn → Aquarius
2024-02-13 05:05 UTC   Mars       Aquarius → Pisces
...
```

**Options:**

| Flag | Description |
|------|-------------|
| `-p, --planet <name>` | Filter by planet |

Planets: `Sun Moon Mercury Venus Mars Jupiter Saturn Uranus Neptune Pluto`

### `retro` — Retrograde Stations

List retrograde periods (station retrograde → station direct).

```bash
stargazer retro --from 2024-01-01 --to 2024-12-31
stargazer retro --from 2024-01-01 --to 2024-12-31 --planet Mercury
```

```
Retrograde Periods
────────────────────────────────────────────────────────────────────────
Planet:  Mercury
Period:  2024-01-01 → 2024-12-31
────────────────────────────────────────────────────────────────────────
Rx Mercury    2024-04-01 – 2024-04-25   24d   Aries
Rx Mercury    2024-08-05 – 2024-08-28   23d   Virgo → Leo
Rx Mercury    2024-11-25 – 2024-12-15   20d   Sagittarius
────────────────────────────────────────────────────────────────────────
Total: 3 retrograde period(s)
```

**Options:**

| Flag | Description |
|------|-------------|
| `-p, --planet <name>` | Filter by planet |

Planets: `Mercury Venus Mars Jupiter Saturn Uranus Neptune Pluto`

### `eclipse` — Eclipses

List solar and lunar eclipses.

```bash
stargazer eclipse --from 2024-01-01 --to 2024-12-31
stargazer eclipse --from 2024-01-01 --to 2024-12-31 --type solar
```

```
Eclipses
──────────────────────────────────────────────────────────
Type:    solar + lunar
Period:  2024-01-01 → 2024-12-31
──────────────────────────────────────────────────────────
☽ lunar penumbral    2024-03-25 07:13 UTC   obscuration 95.6%
☀ solar total        2024-04-08 18:18 UTC
☽ lunar partial      2024-09-18 02:44 UTC   obscuration 8.6%
☀ solar annular      2024-10-02 18:46 UTC
──────────────────────────────────────────────────────────
Total: 4 eclipse(s)
```

**Options:**

| Flag | Description |
|------|-------------|
| `-t, --type <solar\|lunar>` | Filter by eclipse type |

## Common Options

All commands share these options:

| Flag | Description |
|------|-------------|
| `-f, --from <iso>` | Start date (ISO format, required) |
| `-T, --to <iso>` | End date (ISO format, required) |
| `-j, --json` | Output as JSON |

## JSON Output

All commands support `--json` for programmatic use:

```bash
stargazer moon --from 2024-01-01 --to 2024-03-31 --json
```

```json
[
  {
    "name": "Last Quarter",
    "date": "2024-01-04T03:30:27.000Z",
    "longitude": 283.18,
    "sign": "Capricorn"
  },
  ...
]
```

## Library Usage

```typescript
import {
  moonPhasesInRange,
  retrogradesInRange,
  eclipsesInRange,
  aspectsInRange,
  ingressesInRange,
  longitudeToSign,
  type MoonPhaseEvent,
  type RetrogradeStation,
  type EclipseEvent,
} from "@shepherd-terminal/stargazer";

const phases = moonPhasesInRange(new Date("2024-01-01"), new Date("2024-12-31"));
const retros = retrogradesInRange("Mercury", new Date("2024-01-01"), new Date("2024-12-31"));
const eclipses = eclipsesInRange(new Date("2024-01-01"), new Date("2024-12-31"));

const sunMoonAspects = aspectsInRange(
  "Sun",
  "Moon",
  new Date("2024-01-01"),
  new Date("2024-06-01"),
  "opposition" // optional filter
);
```

## Data Source

Calculations use [astronomy-engine](https://github.com/cosinekitty/astronomy) by Don Cross — a pure TypeScript/JavaScript implementation of the VSOP87 and related planetary theories. It produces sub-minute accuracy for dates in the range 1800–2200 CE. No API calls or external datasets are required.

## Development

```bash
bun install
bun run dev -- moon --from 2024-01-01 --to 2024-03-31
bun test
bun run build
```

## Release

Releases are triggered via the [Release workflow](.github/workflows/release.yml) in GitHub Actions. The workflow detects the version bump from conventional commits or accepts a manual override (`patch`, `minor`, `major`). It builds, tests, publishes to npm with provenance, tags the commit, and creates a GitHub release.

## License

MIT

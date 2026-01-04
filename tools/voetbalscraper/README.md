# SoccerWiki Scraper

Een robuuste TypeScript/Node.js scraper voor [nl.soccerwiki.org](https://nl.soccerwiki.org) die:

- Club squad pagina's ophaalt
- Spelers uit tabellen parsed
- PlayerIDs uit links haalt
- Data exporteert naar JSON + CSV
- Rate limiting en retry logic bevat

## Quick Start

```bash
# Install dependencies
npm install

# Run scraper
npm run scrape
```

## Output

De scraper genereert de volgende bestanden in `./output/`:

- `clubs.json` / `clubs.csv` - Club informatie
- `players.json` / `players.csv` - Unieke spelers
- `memberships.json` / `memberships.csv` - Speler-club relaties met posities en ratings

## Configuratie

In [src/scrape.ts](src/scrape.ts) kun je aanpassen:

```ts
// Welke clubs scrapen (clubId)
const clubIds = [180]; // Ajax = 180

// Rate limiting instellingen
const CONCURRENCY = 2; // aantal gelijktijdige requests
const MIN_DELAY_MS = 900; // basis vertraging tussen requests
const JITTER_MS = 400; // random extra vertraging
```

## Veelgebruikte Club IDs

- Ajax: 180
- PSV: 174
- Feyenoord: 171
- AZ: 182
- FC Utrecht: 188

## Data Schema

### Club
```ts
{
  clubId: number;
  name?: string;
  sourceUrl: string;
}
```

### Player
```ts
{
  playerId: number;
  name: string;
  sourceUrl: string;
}
```

### PlayerClubMembership
```ts
{
  clubId: number;
  playerId: number;
  playerName: string;
  position?: string;
  rating?: number; // "Be" kolom
  shirtNumber?: number;
}
```

## Features

- **Robuust parsing**: Gebruikt header->kolom mapping in plaats van vaste kolom posities
- **Rate limiting**: Voorkomt dat je geblokkeerd wordt
- **Retry logic**: Automatische retry bij 429/5xx errors
- **Deduplicatie**: Unieke spelers over meerdere clubs
- **Flexibel**: Gemakkelijk uit te breiden met meer data types

## Development

```bash
# Development mode met hot reload
npm run dev

# Build TypeScript
npm run build
```

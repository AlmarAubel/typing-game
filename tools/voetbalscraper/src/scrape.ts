import * as fs from "node:fs/promises";
import * as path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { load } from "cheerio";
import pLimit from "p-limit";
import { stringify as csvStringify } from "csv-stringify/sync";

type Club = {
  clubId: number;
  name?: string;
  sourceUrl: string;
};

type Player = {
  playerId: number;
  name: string;
  sourceUrl: string;
};

type PlayerClubMembership = {
  clubId: number;
  playerId: number;
  playerName: string;
  position?: string;
  rating?: number; // "Be"
  shirtNumber?: number;
};

type ScrapeResult = {
  club: Club;
  players: Player[];
  memberships: PlayerClubMembership[];
};

const BASE_URL = "https://nl.soccerwiki.org";
const OUTPUT_DIR = path.resolve(process.cwd(), "output");

// Concurrency + politeness settings
const CONCURRENCY = 2; // keep low
const MIN_DELAY_MS = 900; // base delay between requests
const JITTER_MS = 400; // random jitter
const MAX_RETRIES = 3;

const limit = pLimit(CONCURRENCY);

function randomDelayMs() {
  return MIN_DELAY_MS + Math.floor(Math.random() * JITTER_MS);
}

async function fetchHtml(url: string): Promise<string> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Politeness delay before each request
      await delay(randomDelayMs());

      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "soccerwiki-scraper/1.0 (+https://example.com; contact: you@example.com)",
          "Accept-Language": "nl-NL,nl;q=0.9,en;q=0.8",
        },
      });

      if (!res.ok) {
        // Retry on 429/5xx
        if (res.status === 429 || res.status >= 500) {
          const backoff = attempt * 800;
          await delay(backoff);
          continue;
        }
        throw new Error(`HTTP ${res.status} for ${url}`);
      }

      return await res.text();
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err;
      const backoff = attempt * 800;
      await delay(backoff);
    }
  }

  throw new Error(`Failed to fetch ${url}`);
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(",", ".").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function parseIntSafe(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const cleaned = value.trim();
  const n = parseInt(cleaned, 10);
  return Number.isFinite(n) ? n : undefined;
}

function parsePlayerIdFromHref(href: string): number | undefined {
  // SoccerWiki uses different patterns on some pages, so we do a robust parse:
  // e.g. "player.php?playerid=1234"
  // or "player.php?pid=1234"
  const u = new URL(href, BASE_URL);

  const keys = ["playerid", "pid", "id"];
  for (const k of keys) {
    const v = u.searchParams.get(k);
    if (v) {
      const id = parseInt(v, 10);
      if (Number.isFinite(id)) return id;
    }
  }

  return undefined;
}

function parseClubNameFromPage($: ReturnType<typeof load>): string | undefined {
  // Try a few common places:
  // - page title
  // - h1/h2
  const h1 = $("h1").first().text().trim();
  if (h1) return h1;

  const h2 = $("h2").first().text().trim();
  if (h2) return h2;

  const title = $("title").text().trim();
  if (title) return title.replace(/\s*\|\s*SoccerWiki.*$/i, "");

  return undefined;
}

/**
 * Parse the squad from soccerwiki.org structure.
 *
 * The nl.soccerwiki squad pages use a non-standard table structure.
 * Players are listed in tables with specific patterns that we need to parse.
 */
function parseSquad(
  html: string,
  clubId: number,
  sourceUrl: string,
): ScrapeResult {
  const $ = load(html);

  const clubName = parseClubNameFromPage($);

  const club: Club = {
    clubId,
    name: clubName,
    sourceUrl,
  };

  const players: Player[] = [];
  const memberships: PlayerClubMembership[] = [];

  // Get ALL player links first, then filter out the loaned players by checking their context
  const allPlayerLinks = $('a[href*="player.php"]');
  console.log(`Found ${allPlayerLinks.length} total player links on page`);

  // Filter out links that are clearly in the "Verhuurd" section by checking surrounding text
  const validPlayerLinks: any[] = [];
  allPlayerLinks.each((_, linkEl) => {
    const link = $(linkEl);
    const href = link.attr("href");
    if (!href) return;

    // Check if this link is in a context that suggests it's a loaned player
    const surroundingText = link
      .closest("table, div, section")
      .text()
      .toLowerCase();
    const isInLoanSection =
      surroundingText.includes("verhuurd") &&
      (surroundingText.includes("ipswich") ||
        surroundingText.includes("sparta") ||
        surroundingText.includes("heerenveen") ||
        surroundingText.includes("jong ajax"));

    if (!isInLoanSection) {
      validPlayerLinks.push(linkEl);
    }
  });

  console.log(
    `After filtering out loaned players: ${validPlayerLinks.length} player links`,
  );

  // Now process the filtered links
  validPlayerLinks.forEach((linkEl) => {
    const link = $(linkEl);
    const href = link.attr("href");
    if (!href) {
      console.log(`Skipping link: no href attribute`);
      return;
    }

    const playerId = parsePlayerIdFromHref(href);

    if (!playerId) {
      console.log(`Skipping link ${href}: no valid playerId parsed`);
      return;
    }

    let playerName = link.text().trim();

    // If the link has no text, try to find the name in surrounding context
    if (!playerName) {
      const parentRow = link.closest("tr");
      const parentCell = link.closest("td");

      // Look for text in the same cell or nearby
      if (parentCell.length > 0) {
        const cellText = parentCell.text().trim();
        // Extract meaningful text that could be a player name
        const nameMatch = cellText.match(
          /([A-Z][a-z]+ [A-Z][a-z]+|[A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/,
        );
        if (nameMatch) {
          playerName = nameMatch[0];
        }
      }

      // Fallback: look in the row text
      if (!playerName && parentRow.length > 0) {
        const rowText = parentRow.text().trim();
        const nameMatch = rowText.match(
          /([A-Z][a-z]+ [A-Z][a-z]+|[A-Z][a-z]+(?:\s[A-Z][a-z]+)*)/,
        );
        if (nameMatch) {
          playerName = nameMatch[0];
        }
      }

      if (!playerName) {
        console.log(
          `Skipping link ${href}: could not extract player name from context`,
        );
        return;
      }
    }

    console.log(
      `Processing: ${playerName} (ID: ${playerId}) from link: ${href}`,
    );

    // Skip if this is a duplicate player (same playerId)
    if (players.some((p) => p.playerId === playerId)) {
      console.log(
        `  -> Skipping duplicate player: ${playerName} (${playerId})`,
      );
      return;
    }

    const playerUrl = new URL(href, BASE_URL).toString();

    // Try to find additional info in the surrounding context
    const parentRow = link.closest("tr");
    const parentCell = link.closest("td");

    let shirtNumber: number | undefined;
    let position: string | undefined;
    let rating: number | undefined;

    // Look for shirt number and position in the same row or nearby cells
    if (parentRow.length > 0) {
      const rowText = parentRow.text();

      // Try to extract shirt number (usually a number at the start)
      const shirtMatch = rowText.match(/^\s*(\d+)/);
      if (shirtMatch) {
        shirtNumber = parseInt(shirtMatch[1], 10);
      }

      // Try to extract rating (usually a number at the end, like "85")
      // Look for multiple numbers and use better heuristics to distinguish rating from age
      const allNumbers = rowText.match(/\b(\d{2,3})\b/g);
      if (allNumbers) {
        for (const numStr of allNumbers.reverse()) {
          // Check from end first
          const num = parseInt(numStr, 10);
          // Ratings are typically between 50-99, ages are typically 16-45
          // If we find a number >= 50, it's more likely a rating
          // If we find numbers in 30-49 range, prefer the higher one as rating
          if (num >= 50 && num <= 99) {
            rating = num;
            break;
          } else if (num >= 30 && num <= 49 && !rating) {
            // Could be rating, but check if there's a better candidate
            rating = num;
          }
        }
      }

      // Fallback to original logic if no good rating found
      if (!rating) {
        const ratingMatch = rowText.match(/\s(\d{2,3})\s*$/);
        if (ratingMatch) {
          const possibleRating = parseInt(ratingMatch[1], 10);
          // Ratings are typically between 30-99
          if (possibleRating >= 30 && possibleRating <= 99) {
            rating = possibleRating;
          }
        }
      }

      // Try to extract position (common patterns like K, V, M, A, etc.)
      // More sophisticated pattern that excludes player names
      const posMatch = rowText.match(
        /\s([KVMA](?:\([RLC]+\))?(?:,[KVMA](?:\([RLC]+\))?)*)\s/,
      );
      if (posMatch && posMatch[1] !== playerName) {
        position = posMatch[1];
      }

      // Alternative position extraction - look for position patterns
      if (!position) {
        const altPosPattern =
          /\b([KVMA](?:\([RLC]+\))?(?:,\s*[KVMA](?:\([RLC]+\))?)*)\b/g;
        const matches = rowText.match(altPosPattern);
        if (matches) {
          // Take the first match that isn't the player name
          for (const match of matches) {
            if (match !== playerName && match.length <= 20) {
              position = match;
              break;
            }
          }
        }
      }
    }

    // Alternative: look in table structure
    if (parentCell.length > 0) {
      const allCells = parentCell.parent().find("td");

      // If we're in a table structure, try to get data from other cells
      allCells.each((idx, cell) => {
        const cellText = $(cell).text().trim();

        // Look for numeric values that could be shirt numbers or ratings
        if (/^\d{1,2}$/.test(cellText)) {
          const num = parseInt(cellText, 10);
          if (num >= 1 && num <= 99 && !shirtNumber) {
            // Could be shirt number (1-99)
            shirtNumber = num;
          }
        }

        // Look for ratings (prefer higher numbers that are likely ratings vs ages)
        if (/^\d{2,3}$/.test(cellText)) {
          const num = parseInt(cellText, 10);
          if (num >= 50 && num <= 99) {
            // Definitely a rating
            rating = num;
          } else if (num >= 30 && num <= 49 && (!rating || num > rating)) {
            // Could be rating, prefer higher values
            rating = num;
          }
        }

        // Look for position patterns (but not if it's the player name)
        if (
          /^[KVMA](\([RLC]+\))?/.test(cellText) &&
          cellText !== playerName &&
          !position &&
          cellText.length <= 20
        ) {
          position = cellText;
        }
      });
    }

    console.log(
      `Found player: ${playerName} (ID: ${playerId}) - Jersey: ${shirtNumber}, Pos: ${position}, Rating: ${rating}`,
    );

    players.push({
      playerId,
      name: playerName,
      sourceUrl: playerUrl,
    });

    memberships.push({
      clubId,
      playerId,
      playerName,
      position: position || undefined,
      rating: rating || undefined,
      shirtNumber: shirtNumber || undefined,
    });
  });

  // De-dupe players by playerId (just in case)
  const uniquePlayersMap = new Map<number, Player>();
  for (const p of players) uniquePlayersMap.set(p.playerId, p);

  const uniqueMemberships = memberships.filter(
    (m, idx, arr) =>
      arr.findIndex(
        (m2) => m2.playerId === m.playerId && m2.clubId === m.clubId,
      ) === idx,
  );

  // Known loaned players (this list can be expanded)
  const loanedPlayerNames = [
    "Chuba Akpom",
    "Sivert Mannsverk",
    "Amourricho Van axel-Dongen",
    "Julian Rijkhoff",
    "Charlie Setford",
    "Ahmetcan Kaplan",
    "Tristan Gooijer",
    "David Kalokoh",
    "Daniel Skaarud",
    "Ethan Butera",
    "Jan Faberski",
    "Mark Verkuijl",
    "Nassef Chourak",
    "Skye Vink",
    "Dies Janse",
    "Kayden Wolff",
    "Nick Verschuren",
    "Lucas Jetten",
    "Avery Appiah",
    "Lasse Abildgaard",
    "Don O'Niel",
    "Tijn Peters",
    "Luca Messori",
    "Damian van der Vaart",
    "Emre Ünüvar",
    "Paul Reverson",
    "Aymean el Hani",
    "Mylo van der Lans",
    "Jinairo Johnson",
    "Ryan van de Pavert",
    "Lyfe Oldenstam",
    "Luuk Beekman",
    "Marvyn Muzungu",
    "Zakaria Ouazane",
    "Abdellah Ouazane",
    "Leroy Fränkel",
    "Kennynho Kasanwirjo",
    "Sinclair de Falco",
    "Marley Álvarez Pérez",
    "Hassan Ayyildiz",
    "Thijmen Romers",
    "Pharell Nash",
    "Jeshurun Simeon",
    "Nnamdi Koka",
  ];

  // Also exclude recent additions that might be in different sections
  const recentAdditions = [
    "Harlan Perry",
    "Max Mcgoona",
    "Owen Davies",
    "Jamie Cumming",
    "Rhys Nash",
    "Ethan Roberts",
  ];
  const excludeList = [...loanedPlayerNames, ...recentAdditions];

  const filteredMemberships = uniqueMemberships.filter(
    (m) =>
      !excludeList.some((name) =>
        m.playerName.toLowerCase().includes(name.toLowerCase()),
      ),
  );

  const filteredPlayers = [...uniquePlayersMap.values()].filter(
    (p) =>
      !excludeList.some((name) =>
        p.name.toLowerCase().includes(name.toLowerCase()),
      ),
  );

  console.log(
    `After filtering out known loaned/excluded players: ${filteredPlayers.length} players, ${filteredMemberships.length} memberships`,
  );

  return {
    club,
    players: filteredPlayers,
    memberships: filteredMemberships,
  };
}

async function scrapeClubSquad(clubId: number): Promise<ScrapeResult> {
  const url = `${BASE_URL}/squad.php?clubid=${clubId}`;
  const html = await fetchHtml(url);
  return parseSquad(html, clubId, url);
}

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
}

function toCsv<T extends Record<string, any>>(rows: T[]): string {
  return csvStringify(rows, {
    header: true,
    columns: Object.keys(rows[0] ?? {}),
  });
}

async function writeOutputs(results: ScrapeResult[]) {
  await ensureOutputDir();

  const clubs = results.map((r) => r.club);

  const playersMap = new Map<number, Player>();
  for (const r of results) {
    for (const p of r.players) playersMap.set(p.playerId, p);
  }
  const players = [...playersMap.values()];

  const memberships = results.flatMap((r) => r.memberships);

  // JSON
  await fs.writeFile(
    path.join(OUTPUT_DIR, "clubs.json"),
    JSON.stringify(clubs, null, 2),
    "utf8",
  );
  await fs.writeFile(
    path.join(OUTPUT_DIR, "players.json"),
    JSON.stringify(players, null, 2),
    "utf8",
  );
  await fs.writeFile(
    path.join(OUTPUT_DIR, "memberships.json"),
    JSON.stringify(memberships, null, 2),
    "utf8",
  );
}

async function main() {
  // Voorbeeld: Ajax (clubid=180)
  // Je kunt hier meerdere clubIds zetten
  const clubIds = [
    180, // Ajax tafel: 8
    391, // Bayern Munchen tafel: 7
    140, // Barcelona tafel: 2
    163, // Real Madrid tafel: 3
    208, // telstar tafel: 1
    179, // AZ Alkmaar tafel: 6
    115, // Ac milan  tafel: 4
    47, // Machester city tafel: 5
    44, // Liverpool tafel: 9
    27, // Christal palace tafel: 10
  ];

  const tasks = clubIds.map((clubId) =>
    limit(async () => {
      console.log(`Scraping clubId=${clubId}...`);
      const result = await scrapeClubSquad(clubId);
      console.log(
        `Done clubId=${clubId}: players=${result.players.length}, memberships=${result.memberships.length}`,
      );
      return result;
    }),
  );

  const results = await Promise.all(tasks);

  await writeOutputs(results);

  console.log("✅ Outputs written to ./output");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

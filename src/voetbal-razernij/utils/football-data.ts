// Football data transformation and types
import clubsData from "../assets/clubs.json";
import playersData from "../assets/players.json";
import membershipsData from "../assets/memberships.json";

export interface Club {
  id: number;
  name: string;
  shortName: string;
  badge?: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface Player {
  id: number;
  name: string;
  clubId: number;
  position: PlayerPosition;
  rating: number;
  shirtNumber: number;
  rarity: PlayerRarity;
  imageUrl?: string;
  sourceUrl?: string;
}

export type PlayerPosition = "K" | "D" | "M" | "A";
export type PlayerRarity = "common" | "uncommon" | "rare" | "legendary";
export type PackType = "bronze" | "silver" | "gold";

export interface ClubProgress {
  clubId: number;
  xp: number;
  tokens: number;
  unlockedPacks: PackType[];
}

export interface PlayerCard extends Player {
  copies: number;
  firstObtained: Date;
}

export interface TeamSlot {
  position: PlayerPosition;
  playerId?: number;
  slotNumber: number;
}

// Transform raw scraped data into game-ready structures
class FootballDataService {
  private static clubs: Club[] = [];
  private static players: Player[] = [];
  private static initialized = false;

  static async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Use the imported static data
      const rawClubs = clubsData;
      const rawMemberships = membershipsData;

      console.log("Loading football data...");
      console.log(`Raw clubs: ${rawClubs.length}`);
      console.log(`Raw memberships: ${rawMemberships.length}`);

      // Transform clubs with styling
      this.clubs = this.transformClubs(rawClubs);
      console.log(`Transformed clubs: ${this.clubs.length}`);

      // Transform players with rarity and position mapping
      this.players = this.transformPlayers(rawMemberships);
      console.log(`Transformed players: ${this.players.length}`);

      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize football data:", error);
      throw error;
    }
  }

  private static transformClubs(rawClubs: any[]): Club[] {
    const clubColors: Record<
      number,
      { primary: string; secondary: string; short: string }
    > = {
      180: { primary: "#D2122E", secondary: "#FFFFFF", short: "AJX" }, // Ajax
      204: { primary: "#ED1C24", secondary: "#FFFFFF", short: "PSV" }, // PSV
      177: { primary: "#E30613", secondary: "#FFFFFF", short: "FEY" }, // Feyenoord
      182: { primary: "#FF0000", secondary: "#FFFFFF", short: "AZ" }, // AZ
      194: { primary: "#B71C1C", secondary: "#FFFFFF", short: "UTR" }, // FC Utrecht
      200: { primary: "#D32F2F", secondary: "#FFFFFF", short: "TWE" }, // FC Twente
      195: { primary: "#FFD700", secondary: "#000000", short: "VIT" }, // Vitesse
      185: { primary: "#0066CC", secondary: "#FFFFFF", short: "HEE" }, // sc Heerenveen
      186: { primary: "#00FF00", secondary: "#FFFFFF", short: "GRO" }, // FC Groningen
      188: { primary: "#000000", secondary: "#FFFFFF", short: "HER" }, // Heracles
    };

    return rawClubs.map((club) => ({
      id: club.clubId,
      name: club.name,
      shortName:
        clubColors[club.clubId]?.short ||
        club.name.substring(0, 3).toUpperCase(),
      primaryColor: clubColors[club.clubId]?.primary || "#1976D2",
      secondaryColor: clubColors[club.clubId]?.secondary || "#FFFFFF",
    }));
  }

  private static transformPlayers(rawMemberships: any[]): Player[] {
    return rawMemberships.map((membership) => {
      // Generate image URL from sourceUrl if available
      let imageUrl: string | undefined;
      if (membership.playerId) {
        // Generate image URL - these URLs typically follow a pattern
        imageUrl = `https://cdn.soccerwiki.org/images/player/${membership.playerId}.png`;
      }

      return {
        id: membership.playerId,
        name: membership.playerName,
        clubId: membership.clubId,
        position: this.normalizePosition(membership.position),
        rating: membership.rating,
        shirtNumber: membership.shirtNumber,
        rarity: this.calculateRarity(membership.rating),
        imageUrl,
        sourceUrl: membership.sourceUrl,
      };
    });
  }

  private static normalizePosition(position: string): PlayerPosition {
    if (position.includes("K")) return "K";
    if (position.includes("D") || position.includes("B")) return "D";
    if (position.includes("M")) return "M";
    if (position.includes("A")) return "A";
    return "M"; // Default to midfielder
  }

  private static calculateRarity(rating: number): PlayerRarity {
    if (rating >= 80) return "legendary";
    if (rating >= 60) return "rare";
    if (rating >= 40) return "uncommon";
    return "common";
  }

  // Public API methods
  static getAllClubs(): Club[] {
    if (!this.initialized) {
      console.warn("FootballDataService not initialized yet");
      return [];
    }
    return [...this.clubs];
  }

  static getClubById(id: number): Club | undefined {
    if (!this.initialized) {
      console.warn("FootballDataService not initialized yet");
      return undefined;
    }
    return this.clubs.find((club) => club.id === id);
  }

  static getPlayersByClub(clubId: number): Player[] {
    if (!this.initialized) {
      console.warn("FootballDataService not initialized yet");
      return [];
    }
    console.log(`Looking for players for club ${clubId}`);
    console.log(`Total players loaded: ${this.players.length}`);

    const clubPlayers = this.players.filter(
      (player) => player.clubId === clubId,
    );
    console.log(`Found ${clubPlayers.length} players for club ${clubId}`);

    if (clubPlayers.length === 0) {
      // Debug: show all available club IDs
      const availableClubIds = [...new Set(this.players.map((p) => p.clubId))];
      console.log("Available club IDs:", availableClubIds);
    }

    return clubPlayers;
  }

  static getPlayersByPosition(position: PlayerPosition): Player[] {
    if (!this.initialized) {
      console.warn("FootballDataService not initialized yet");
      return [];
    }
    return this.players.filter((player) => player.position === position);
  }

  static getPlayerById(id: number): Player | undefined {
    if (!this.initialized) {
      console.warn("FootballDataService not initialized yet");
      return undefined;
    }
    return this.players.find((player) => player.id === id);
  }

  static getAllPlayers(): Player[] {
    if (!this.initialized) {
      console.warn("FootballDataService not initialized yet");
      return [];
    }
    return [...this.players];
  }

  static getAllClubs(): Club[] {
    if (!this.initialized) {
      console.warn("FootballDataService not initialized yet");
      return [];
    }
    return [...this.clubs];
  }

  static isInitialized(): boolean {
    return this.initialized;
  }

  private static ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error(
        "FootballDataService not initialized. Call initialize() first.",
      );
    }
  }
}

export { FootballDataService };

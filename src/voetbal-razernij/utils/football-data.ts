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

      // Transform clubs with styling
      this.clubs = this.transformClubs(rawClubs);

      // Transform players with rarity and position mapping
      this.players = this.transformPlayers(rawMemberships);

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
      391: { primary: "#DC052D", secondary: "#FFFFFF", short: "FCB" }, // Bayern München
      140: { primary: "#A50044", secondary: "#004D98", short: "BAR" }, // Barcelona
      163: { primary: "#FEBE10", secondary: "#00529F", short: "RMA" }, // Real Madrid
      208: { primary: "#FFFFFF", secondary: "#FF0000", short: "TEL" }, // Telstar
      179: { primary: "#FF0000", secondary: "#FFFFFF", short: "AZ" }, // AZ Alkmaar
      115: { primary: "#AC1E44", secondary: "#000000", short: "MIL" }, // AC Milan
      47: { primary: "#6CABDD", secondary: "#FFFFFF", short: "MCI" }, // Manchester City
      44: { primary: "#C8102E", secondary: "#FFFFFF", short: "LIV" }, // Liverpool
      27: { primary: "#1B458F", secondary: "#A7A5A6", short: "CRY" }, // Crystal Palace
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
        rating: membership.rating ?? 50,
        shirtNumber: membership.shirtNumber,
        rarity: this.calculateRarity(membership.rating),
        imageUrl,
        sourceUrl: membership.sourceUrl,
      };
    });
  }

  private static normalizePosition(position?: string): PlayerPosition {
    if (position?.includes("K")) return "K";
    if (position?.includes("D") || position?.includes("B")) return "D";
    if (position?.includes("M")) return "M";
    if (position?.includes("A")) return "A";
    return "M"; // Default to midfielder
  }

  private static calculateRarity(rating: number): PlayerRarity {
    if (rating >= 90) return "legendary";
    if (rating >= 85) return "rare";
    if (rating >= 80) return "uncommon";
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

    const clubPlayers = this.players.filter(
      (player) => player.clubId === clubId,
    );

    if (clubPlayers.length === 0) {
      // Debug: show all available club IDs
      const availableClubIds = [...new Set(this.players.map((p) => p.clubId))];
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

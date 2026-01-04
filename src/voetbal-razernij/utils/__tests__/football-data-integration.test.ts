import { describe, it, expect, beforeAll, vi } from "vitest";
import { FootballDataService } from "../football-data";
import type { Player, PlayerPosition } from "../football-data";

describe("FootballDataService - Integration Tests", () => {
  beforeAll(async () => {
    await FootballDataService.initialize();
  });

  describe("initialization", () => {
    it("should initialize successfully", () => {
      expect(FootballDataService.isInitialized()).toBe(true);
    });

    it("should load clubs data", () => {
      const ajax = FootballDataService.getClubById(180);
      expect(ajax).toBeDefined();
      expect(ajax?.name).toBe("Ajax");
    });

    it("should load players data", () => {
      const players = FootballDataService.getAllPlayers();
      expect(players.length).toBeGreaterThan(0);
    });
  });

  describe("club transformations", () => {
    it("should transform Ajax with correct styling", () => {
      const ajax = FootballDataService.getClubById(180);

      expect(ajax).toMatchObject({
        id: 180,
        name: "Ajax",
        shortName: "AJX",
        primaryColor: "#D2122E",
        secondaryColor: "#FFFFFF",
      });
    });

    it("should transform Bayern München with correct styling", () => {
      const bayern = FootballDataService.getClubById(391);

      expect(bayern).toMatchObject({
        id: 391,
        name: "Bayern München",
        shortName: "FCB",
        primaryColor: "#DC052D",
        secondaryColor: "#FFFFFF",
      });
    });

    it("should transform Barcelona with correct styling", () => {
      const barcelona = FootballDataService.getClubById(140);

      expect(barcelona).toMatchObject({
        id: 140,
        name: "Barcelona",
        shortName: "BAR",
        primaryColor: "#A50044",
        secondaryColor: "#004D98",
      });
    });

    it("should apply default colors for clubs without predefined styling", () => {
      // Telstar (id 208) doesn't have predefined colors in the hardcoded map
      const telstar = FootballDataService.getClubById(208);

      expect(telstar).toBeDefined();
      expect(telstar?.id).toBe(208);
      expect(telstar?.primaryColor).toBeDefined();
      expect(telstar?.secondaryColor).toBeDefined();
      expect(telstar?.shortName).toHaveLength(3);
    });
  });

  describe("player transformations", () => {
    it("should generate image URLs for players", () => {
      const players = FootballDataService.getAllPlayers();
      const playerWithId = players.find((p) => p.id > 0);

      expect(playerWithId).toBeDefined();
      expect(playerWithId?.imageUrl).toBeDefined();
      expect(playerWithId?.imageUrl).toContain("soccerwiki.org");
      expect(playerWithId?.imageUrl).toContain(String(playerWithId?.id));
    });

    it("should normalize positions to K, D, M, or A", () => {
      const players = FootballDataService.getAllPlayers();

      players.forEach((player) => {
        expect(["K", "D", "M", "A"]).toContain(player.position);
      });
    });

    it("should calculate rarity based on rating", () => {
      const players = FootballDataService.getAllPlayers();

      const legendaryPlayers = players.filter((p) => p.rarity === "legendary");
      const rarePlayers = players.filter((p) => p.rarity === "rare");
      const uncommonPlayers = players.filter((p) => p.rarity === "uncommon");
      const commonPlayers = players.filter((p) => p.rarity === "common");

      // Verify all legendary players have rating >= 90
      legendaryPlayers.forEach((p) => {
        expect(p.rating).toBeGreaterThanOrEqual(90);
      });

      // Verify all rare players have rating >= 85 and < 90
      rarePlayers.forEach((p) => {
        expect(p.rating).toBeGreaterThanOrEqual(85);
        expect(p.rating).toBeLessThan(90);
      });

      // Verify all uncommon players have rating >= 80 and < 85
      uncommonPlayers.forEach((p) => {
        expect(p.rating).toBeGreaterThanOrEqual(80);
        expect(p.rating).toBeLessThan(85);
      });

      // Verify all common players have rating < 80
      commonPlayers.forEach((p) => {
        expect(p.rating).toBeLessThan(80);
      });

      // All players should have a rarity
      expect(
        legendaryPlayers.length +
          rarePlayers.length +
          uncommonPlayers.length +
          commonPlayers.length,
      ).toBe(players.length);
    });
  });

  describe("query methods", () => {
    it("should retrieve club by ID", () => {
      const ajax = FootballDataService.getClubById(180);

      expect(ajax).toBeDefined();
      expect(ajax?.id).toBe(180);
      expect(ajax?.name).toBe("Ajax");
    });

    it("should return undefined for non-existent club", () => {
      const nonExistent = FootballDataService.getClubById(999999);

      expect(nonExistent).toBeUndefined();
    });

    it("should retrieve player by ID", () => {
      const allPlayers = FootballDataService.getAllPlayers();
      const firstPlayer = allPlayers[0];

      const player = FootballDataService.getPlayerById(firstPlayer.id);

      expect(player).toBeDefined();
      expect(player?.id).toBe(firstPlayer.id);
      expect(player?.name).toBe(firstPlayer.name);
    });

    it("should return undefined for non-existent player", () => {
      const nonExistent = FootballDataService.getPlayerById(999999);

      expect(nonExistent).toBeUndefined();
    });

    it("should retrieve players by club", () => {
      const ajaxPlayers = FootballDataService.getPlayersByClub(180);

      expect(ajaxPlayers.length).toBeGreaterThan(0);
      expect(ajaxPlayers.every((p) => p.clubId === 180)).toBe(true);
    });

    it("should retrieve players by position", () => {
      const keepers = FootballDataService.getPlayersByPosition("K");
      const defenders = FootballDataService.getPlayersByPosition("D");
      const midfielders = FootballDataService.getPlayersByPosition("M");
      const attackers = FootballDataService.getPlayersByPosition("A");
      console.log("Defenders found:", defenders.length);
      console.log("attackers found:", attackers.length);
      console.log("Midfielders found:", midfielders.length);
      console.log("Keepers found:", keepers.length);
      expect(keepers.length).toBeGreaterThan(0);
      // Note: Defenders might be empty depending on position normalization
      expect(midfielders.length).toBeGreaterThan(0);
      expect(attackers.length).toBeGreaterThan(0);
      expect(defenders.length).toBeGreaterThan(0);
    });

    it("should return copy of players array", () => {
      const players1 = FootballDataService.getAllPlayers();
      const players2 = FootballDataService.getAllPlayers();

      // Different array instances
      expect(players1).not.toBe(players2);
      // But same content
      expect(players1).toEqual(players2);
    });
  });

  describe("uninitialized state", () => {
    it("should warn when accessing data before initialization", () => {
      const consoleSpy = vi.spyOn(console, "warn");

      // Reset state
      // @ts-expect-error - Accessing private property for testing
      const originalState = FootballDataService.initialized;
      // @ts-expect-error - Accessing private property for testing
      FootballDataService.initialized = false;

      FootballDataService.getClubById(180);

      expect(consoleSpy).toHaveBeenCalledWith(
        "FootballDataService not initialized yet",
      );

      // Restore state
      // @ts-expect-error - Accessing private property for testing
      FootballDataService.initialized = originalState;
    });

    it("should return empty arrays when not initialized", () => {
      // Reset state
      // @ts-expect-error - Accessing private property for testing
      const originalState = FootballDataService.initialized;
      // @ts-expect-error - Accessing private property for testing
      FootballDataService.initialized = false;

      const players = FootballDataService.getAllPlayers();
      const clubPlayers = FootballDataService.getPlayersByClub(180);
      const keepers = FootballDataService.getPlayersByPosition("K");

      expect(players).toEqual([]);
      expect(clubPlayers).toEqual([]);
      expect(keepers).toEqual([]);

      // Restore state
      // @ts-expect-error - Accessing private property for testing
      FootballDataService.initialized = originalState;
    });
  });

  describe("data integrity", () => {
    it("should have valid data for all players", () => {
      const players = FootballDataService.getAllPlayers();

      players.forEach((player) => {
        expect(player.id).toBeTypeOf("number");
        expect(player.name).toBeTypeOf("string");
        expect(player.name.length).toBeGreaterThan(0);
        expect(player.clubId).toBeTypeOf("number");
        expect(["K", "D", "M", "A"]).toContain(player.position);
        expect(player.rating).toBeTypeOf("number");
        expect(player.rating).toBeGreaterThanOrEqual(0);
        expect(player.rating).toBeLessThanOrEqual(100);
        expect(player.shirtNumber).toBeTypeOf("number");
        expect(["common", "uncommon", "rare", "legendary"]).toContain(
          player.rarity,
        );
      });
    });

    it("should have unique player IDs", () => {
      const players = FootballDataService.getAllPlayers();
      const playerIds = players.map((p) => p.id);
      const uniqueIds = new Set(playerIds);

      expect(uniqueIds.size).toBe(players.length);
    });

    it("should have valid club references", () => {
      const players = FootballDataService.getAllPlayers();

      players.forEach((player) => {
        const club = FootballDataService.getClubById(player.clubId);
        expect(club).toBeDefined();
        expect(club?.id).toBe(player.clubId);
      });
    });
  });
});

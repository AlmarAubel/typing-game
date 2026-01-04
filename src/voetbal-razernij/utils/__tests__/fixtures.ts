// Test fixtures for FootballDataService tests
// Small datasets to test transformation and business logic

export const mockClubsData = [
  {
    clubId: 180,
    name: "Ajax",
    sourceUrl: "https://soccer.fandom.com/wiki/Ajax",
  },
  {
    clubId: 391,
    name: "Bayern München",
    sourceUrl: "https://soccer.fandom.com/wiki/Bayern_München",
  },
  {
    clubId: 140,
    name: "Barcelona",
    sourceUrl: "https://soccer.fandom.com/wiki/Barcelona",
  },
  {
    clubId: 999,
    name: "Unknown Club",
    sourceUrl: "https://soccer.fandom.com/wiki/Unknown",
  },
];

export const mockMembershipsData = [
  // Ajax players
  {
    clubId: 180,
    playerId: 3102,
    playerName: "Remko Pasveer",
    position: "K",
    rating: 85,
    shirtNumber: 22,
    nationality: "nl",
    age: 40,
  },
  {
    clubId: 180,
    playerId: 51625,
    playerName: "Jorrel Hato",
    position: "D(LC)",
    rating: 80,
    shirtNumber: 4,
    nationality: "nl",
    age: 18,
  },
  {
    clubId: 180,
    playerId: 12345,
    playerName: "Kenneth Taylor",
    position: "M(C),AM(RC)",
    rating: 78,
    shirtNumber: 8,
    nationality: "nl",
    age: 22,
  },
  {
    clubId: 180,
    playerId: 67890,
    playerName: "Brian Brobbey",
    position: "A(C)",
    rating: 79,
    shirtNumber: 9,
    nationality: "nl",
    age: 22,
  },
  // Bayern players
  {
    clubId: 391,
    playerId: 1001,
    playerName: "Manuel Neuer",
    position: "K",
    rating: 90,
    shirtNumber: 1,
    nationality: "de",
    age: 37,
  },
  {
    clubId: 391,
    playerId: 1002,
    playerName: "Joshua Kimmich",
    position: "M(RC),D(R)",
    rating: 88,
    shirtNumber: 6,
    nationality: "de",
    age: 28,
  },
  {
    clubId: 391,
    playerId: 1003,
    playerName: "Harry Kane",
    position: "A(C)",
    rating: 91,
    shirtNumber: 9,
    nationality: "gb-eng",
    age: 30,
  },
  // Barcelona players
  {
    clubId: 140,
    playerId: 2001,
    playerName: "Marc-André ter Stegen",
    position: "K",
    rating: 87,
    shirtNumber: 1,
    nationality: "de",
    age: 31,
  },
  {
    clubId: 140,
    playerId: 2002,
    playerName: "Pedri",
    position: "M(C),AM(LC)",
    rating: 86,
    shirtNumber: 8,
    nationality: "es",
    age: 21,
  },
  {
    clubId: 140,
    playerId: 2003,
    playerName: "Robert Lewandowski",
    position: "A(C)",
    rating: 89,
    shirtNumber: 9,
    nationality: "pl",
    age: 35,
  },
  // Unknown club player with edge cases
  {
    clubId: 999,
    playerId: 9001,
    playerName: "Test Player",
    position: "V(RLC)", // Unknown position format
    rating: undefined, // No rating - should default to 50
    shirtNumber: 99,
    nationality: "xx",
    age: 25,
  },
  {
    clubId: 999,
    playerId: 9002,
    playerName: "Test Keeper",
    position: "GK", // Alternative keeper notation
    rating: 70,
    shirtNumber: 1,
    nationality: "xx",
    age: 30,
  },
];

// Expected transformed data for testing
export const expectedClubs = [
  {
    id: 180,
    name: "Ajax",
    shortName: "AJX",
    primaryColor: "#D2122E",
    secondaryColor: "#FFFFFF",
  },
  {
    id: 391,
    name: "Bayern München",
    shortName: "FCB",
    primaryColor: "#DC052D",
    secondaryColor: "#FFFFFF",
  },
  {
    id: 140,
    name: "Barcelona",
    shortName: "BAR",
    primaryColor: "#A50044",
    secondaryColor: "#004D98",
  },
  {
    id: 999,
    name: "Unknown Club",
    shortName: "UNK", // First 3 chars uppercase
    primaryColor: "#1976D2", // Default color
    secondaryColor: "#FFFFFF", // Default color
  },
];

export const expectedPlayers = {
  ajax: {
    count: 4,
    keeper: {
      id: 3102,
      name: "Remko Pasveer",
      clubId: 180,
      position: "K",
      rating: 85,
      rarity: "rare", // 85+ is rare
    },
    midfielder: {
      id: 12345,
      name: "Kenneth Taylor",
      position: "M",
      rating: 78,
      rarity: "common",
    },
  },
  bayern: {
    count: 3,
    legendary: {
      id: 1003,
      name: "Harry Kane",
      clubId: 391,
      position: "A",
      rating: 91,
      rarity: "legendary",
    },
  },
  barcelona: {
    count: 3,
    rare: {
      id: 2003,
      name: "Robert Lewandowski",
      rating: 89,
      rarity: "rare",
    },
  },
  unknown: {
    count: 2,
    defaultRating: {
      id: 9001,
      rating: 50, // Should default when undefined
      rarity: "common",
    },
  },
};

// Rarity thresholds for reference
export const rarityThresholds = {
  legendary: 90,
  rare: 85,
  uncommon: 80,
  common: 0,
};

// Position mapping examples
export const positionMappings = {
  keeper: ["K", "GK"],
  defender: ["D(LC)", "D(R)", "B"],
  midfielder: ["M(C)", "M(RC)", "AM(RC)", "AM(LC)"],
  attacker: ["A(C)", "V(RLC)"],
};

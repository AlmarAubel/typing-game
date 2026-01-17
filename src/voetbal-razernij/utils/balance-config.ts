// Balance Configuration for Voetbal Razernij
// Centralized hardcoded configuration for game mechanics

export interface BalanceConfig {
  session: {
    durationMinutes: number;
    maxQuestions: number;
  };
  scoring: {
    correctAnswerCoins: number;
    incorrectAnswerCoins: number;
    correctAnswerXP: number;
    incorrectAnswerXP: number;
  };
  tokens: {
    inspanningsBonus: {
      questionsPerToken: number;
      tokenReward: number;
    };
    streakBonuses: {
      streak3: number;
      streak5: number;
      streakMilestone: number; // Every 5 after streak 5
    };
    sessionEndBonus: {
      minimumQuestions: number;
      activityTokens: number;
      accuracyThreshold: number; // percentage
      accuracyTokens: number;
    };
  };
  medals: {
    correctAnswer: number;
    streakBonus: {
      3: number;
      5: number;
      10: number;
    };
    perfectMatch: number;
    phaseWin: {
      group: number;
      quarter: number;
      semi: number;
      final: number;
    };
  };
  packs: {
    bronze: {
      cost: number;
      cardCount: number;
      unlockXP: number;
    };
    silver: {
      cost: number;
      cardCount: number;
      unlockXP: number;
    };
    gold: {
      cost: number;
      cardCount: number;
      unlockXP: number;
    };
  };
  rarity: {
    distribution: {
      common: number;
      uncommon: number;
      rare: number;
      legendary: number;
    };
    upgradeMultiplier: {
      common: 1;
      uncommon: 1.2;
      rare: 1.5;
      legendary: 2;
    };
  };
  team: {
    formation: {
      keepers: number;
      defenders: number;
      midfielders: number;
      attackers: number;
    };
  };
}

export const BALANCE_CONFIG: BalanceConfig = {
  session: {
    durationMinutes: 5,
    maxQuestions: 100,
  },
  scoring: {
    correctAnswerCoins: 2,
    incorrectAnswerCoins: 1,
    correctAnswerXP: 2,
    incorrectAnswerXP: 1,
  },
  tokens: {
    inspanningsBonus: {
      questionsPerToken: 5,
      tokenReward: 1,
    },
    streakBonuses: {
      streak3: 1,
      streak5: 1,
      streakMilestone: 5,
    },
    sessionEndBonus: {
      minimumQuestions: 20,
      activityTokens: 2,
      accuracyThreshold: 70,
      accuracyTokens: 1,
    },
  },
  medals: {
    correctAnswer: 1,
    streakBonus: {
      3: 2,
      5: 5,
      10: 10,
    },
    perfectMatch: 25,
    phaseWin: {
      group: 10,
      quarter: 20,
      semi: 30,
      final: 50,
    },
  },
  packs: {
    bronze: {
      cost: 3,
      cardCount: 3,
      unlockXP: 0,
    },
    silver: {
      cost: 6,
      cardCount: 4,
      unlockXP: 50,
    },
    gold: {
      cost: 12,
      cardCount: 5,
      unlockXP: 150,
    },
  },
  rarity: {
    distribution: {
      common: 60,
      uncommon: 25,
      rare: 12,
      legendary: 3,
    },
    upgradeMultiplier: {
      common: 1,
      uncommon: 1.2,
      rare: 1.5,
      legendary: 2,
    },
  },
  team: {
    formation: {
      keepers: 1,
      defenders: 4,
      midfielders: 3,
      attackers: 3,
    },
  },
};

// Table to club mapping configuration
export const TABLE_TO_CLUB_MAPPING: Record<number, number> = {
  1: 208, // Telstar
  2: 140, // Barcelona
  3: 163, // Real Madrid
  4: 115, // AC Milan
  5: 47, // Manchester City
  6: 179, // AZ Alkmaar
  7: 391, // Bayern München
  8: 180, // Ajax
  9: 44, // Liverpool
  10: 27, // Crystal Palace
};

// Logic for resolving match events based on math performance and player stats

export type BattlePhase = "attack" | "defense";

export interface BattleState {
  playerScore: number;
  opponentScore: number;
  possession: "player" | "opponent";
  matchTime: number; // in simulated minutes (0-90)
  stamina: number; // Team stamina (0-100)
  momentum: number; // -100 (full opponent) to 100 (full player)
}

export interface BattleAction {
  type: "shoot" | "pass" | "tackle" | "save";
  difficulty: number; // Multiplier for rewards/damage
  description: string;
}

/**
 * Calculates the effectiveness of a move based on rating and answer speed
 * @param rating Player/Team rating (1-100)
 * @param timeToAnswerSeconds How fast the user answered
 * @param isCorrect Was the answer correct?
 */
export function calculateMovePower(
  rating: number,
  timeToAnswerSeconds: number,
  isCorrect: boolean,
): number {
  if (!isCorrect) return 0;

  // Base power comes from player rating
  // 60 rating -> 60 base power
  // 90 rating -> 90 base power
  const basePower = rating;

  // Speed bonus:
  // < 2s: 1.5x
  // < 5s: 1.2x
  // < 10s: 1.0x
  // > 10s: 0.8x
  let speedMultiplier = 1.0;
  if (timeToAnswerSeconds < 2) speedMultiplier = 1.5;
  else if (timeToAnswerSeconds < 5) speedMultiplier = 1.2;
  else if (timeToAnswerSeconds > 10) speedMultiplier = 0.8;

  // Random variance +/- 10%
  const variance = 0.9 + Math.random() * 0.2;

  return Math.floor(basePower * speedMultiplier * variance);
}

export function resolveRound(
  playerPower: number,
  opponentRating: number,
  phase: BattlePhase,
): { success: boolean; message: string; scoreChanged: boolean } {
  // Opponent power is simulated based on their rating + variability
  const opponentPower = opponentRating * (0.8 + Math.random() * 0.4); // 0.8 - 1.2x variance

  if (phase === "attack") {
    // Player is attacking
    if (playerPower > opponentPower) {
      return {
        success: true,
        message: "GOAL! Wat een schot!",
        scoreChanged: true,
      };
    } else {
      return {
        success: false,
        message: "Redding van de keeper!",
        scoreChanged: false,
      };
    }
  } else {
    // Player is defending
    if (playerPower > opponentPower) {
      return {
        success: true,
        message: "Bal veroverd! Geweldige ingreep.",
        scoreChanged: false,
      };
    } else {
      return {
        success: false,
        message: "Tegendoelpunt... de verdediging stond te slapen.",
        scoreChanged: true,
      };
    }
  }
}

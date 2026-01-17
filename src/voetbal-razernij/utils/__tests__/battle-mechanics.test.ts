import { describe, it, expect } from "vitest";
import { calculateMovePower, resolveRound } from "../battle-mechanics";

describe("battle-mechanics", () => {
  describe("calculateMovePower", () => {
    it("returns 0 if answer is incorrect", () => {
      const power = calculateMovePower(90, 1, false);
      expect(power).toBe(0);
    });

    it("gives bonus for fast answers", () => {
      const rating = 80;
      const fastPower = calculateMovePower(rating, 1.5, true);
      const slowPower = calculateMovePower(rating, 12, true);

      // We expect fast power to be roughly 1.5x base, slow roughly 0.8x base
      // Due to randomness, we can't be exact, but the gap should be large
      expect(fastPower).toBeGreaterThan(slowPower);
    });
  });

  describe("resolveRound", () => {
    it("scores a goal when attacking with superior power", () => {
      // Player 1000 power vs Opponent 10 rating (roughly 10 power)
      const result = resolveRound(1000, 10, "attack");
      expect(result.success).toBe(true);
      expect(result.scoreChanged).toBe(true);
      expect(result.message).toContain("GOAL");
    });

    it("concedes a goal when defending with weak power", () => {
      // Player 0 power vs Opponent 100 rating (roughly 100 power)
      const result = resolveRound(0, 100, "defense");
      expect(result.success).toBe(false);
      expect(result.scoreChanged).toBe(true);
      expect(result.message).toContain("Tegendoelpunt");
    });

    it("saves/tackles when defending with strong power", () => {
      // Player 1000 power vs Opponent 10 rating
      const result = resolveRound(1000, 10, "defense");
      expect(result.success).toBe(true); // Successful defense
      expect(result.scoreChanged).toBe(false); // No goal for opponent
      expect(result.message).toContain("Bal veroverd");
    });
  });
});

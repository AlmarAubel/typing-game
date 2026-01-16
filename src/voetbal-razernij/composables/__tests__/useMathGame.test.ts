import { describe, it, expect, beforeEach } from "vitest";
import { useMathGame } from "../useMathGame";

describe("useMathGame", () => {
  let game: ReturnType<typeof useMathGame>;

  beforeEach(() => {
    game = useMathGame();
  });

  it("initializes with default values", () => {
    expect(game.currentQuestion.value).toEqual({ factor1: 1, factor2: 1 });
    expect(game.userAnswer.value).toBe("");
    expect(game.consecutiveWrong.value).toBe(0);
  });

  it("generates questions from a single table", () => {
    game.generateNewQuestion([5]);
    expect(game.currentQuestion.value.factor1).toBe(5);
    expect(game.currentQuestion.value.factor2).toBeGreaterThanOrEqual(1);
    expect(game.currentQuestion.value.factor2).toBeLessThanOrEqual(10);
  });

  it("generates questions randomly from multiple tables", () => {
    // Run multiple times to ensure we get different tables eventually
    const tables = [3, 7];
    const generatedTables = new Set<number>();

    for (let i = 0; i < 50; i++) {
      game.generateNewQuestion(tables);
      generatedTables.add(game.currentQuestion.value.factor1);
    }

    expect(generatedTables.has(3)).toBe(true);
    expect(generatedTables.has(7)).toBe(true);
    expect(generatedTables.size).toBe(2);
  });

  it("correctly evaluates correct answers", () => {
    // Fix the question to 5 x 5
    game.currentQuestion.value = { factor1: 5, factor2: 5 };

    game.userAnswer.value = "25";
    const result = game.submitAnswer();

    expect(result).toBe(true);
    expect(game.lastAnswerCorrect.value).toBe(true);
    expect(game.consecutiveWrong.value).toBe(0);
  });

  it("correctly evaluates incorrect answers", () => {
    // Fix the question to 5 x 5
    game.currentQuestion.value = { factor1: 5, factor2: 5 };

    game.userAnswer.value = "24";
    const result = game.submitAnswer();

    expect(result).toBe(false);
    expect(game.lastAnswerCorrect.value).toBe(false);
    expect(game.consecutiveWrong.value).toBe(1);
  });

  it("tracks consecutive wrong answers", () => {
    game.currentQuestion.value = { factor1: 2, factor2: 2 };

    game.userAnswer.value = "5";
    game.submitAnswer();
    expect(game.consecutiveWrong.value).toBe(1);

    game.userAnswer.value = "6";
    game.submitAnswer();
    expect(game.consecutiveWrong.value).toBe(2);

    game.userAnswer.value = "4";
    game.submitAnswer();
    expect(game.consecutiveWrong.value).toBe(0);
  });
});

import { ref, computed } from "vue";

export interface MathQuestion {
  factor1: number;
  factor2: number;
}

export function useMathGame() {
  const currentQuestion = ref<MathQuestion>({ factor1: 1, factor2: 1 });
  const correctAnswer = computed(
    () => currentQuestion.value.factor1 * currentQuestion.value.factor2,
  );

  const userAnswer = ref<string>("");
  const lastAnswerCorrect = ref<boolean>(false);
  const consecutiveWrong = ref<number>(0);
  const isAnswerFeedbackShowing = ref<boolean>(false);

  /**
   * Generates a new question based on the provided tables.
   * If multiple tables are provided, it picks one at random.
   * @param tables Array of table numbers (e.g. [1, 2, 5])
   */
  function generateNewQuestion(tables: number[]) {
    if (!tables.length) {
      console.warn(
        "No tables provided for question generation, defaulting to table 1",
      );
      tables = [1];
    }

    // Pick a random table from the active tables
    const randomTableIndex = Math.floor(Math.random() * tables.length);
    const factor1 = tables[randomTableIndex];

    // Pick a random multiplier (1-10)
    const factor2 = Math.floor(Math.random() * 10) + 1;

    currentQuestion.value = {
      factor1,
      factor2,
    };

    userAnswer.value = "";
  }

  /**
   * Checks the user's answer against the correct answer.
   * Updates feedback state and consecutive wrong counter.
   * @returns boolean indicating if the answer was correct
   */
  function submitAnswer(): boolean {
    if (!userAnswer.value) return false;

    const answer = parseInt(userAnswer.value);
    const isCorrect = answer === correctAnswer.value;

    lastAnswerCorrect.value = isCorrect;

    if (isCorrect) {
      consecutiveWrong.value = 0;
    } else {
      consecutiveWrong.value++;
    }

    return isCorrect;
  }

  function resetState() {
    consecutiveWrong.value = 0;
    userAnswer.value = "";
    lastAnswerCorrect.value = false;
    isAnswerFeedbackShowing.value = false;
  }

  return {
    currentQuestion,
    correctAnswer,
    userAnswer,
    lastAnswerCorrect,
    consecutiveWrong,
    isAnswerFeedbackShowing,
    generateNewQuestion,
    submitAnswer,
    resetState,
  };
}

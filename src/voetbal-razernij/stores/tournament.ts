import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { TABLE_TO_CLUB_MAPPING } from "../utils/balance-config";

export type TournamentPhase = "group" | "quarter" | "semi" | "final";

export interface TournamentMatch {
  id: string;
  phase: TournamentPhase;
  opponentClubId: number;
  playerScore?: number;
  opponentScore?: number;
  completed: boolean;
  tables: number[]; // Which tables are mixed for this match
}

export interface TournamentState {
  selectedTables: number[];
  currentPhase: TournamentPhase;
  matches: TournamentMatch[];
  currentMatchIndex: number;
  isActive: boolean;
  victories: number;
  defeats: number;
  playerTeamName: string;
  playerClubId: number; // Club ID for team logo
}

export const useTournamentStore = defineStore(
  "voetbal-tournament",
  () => {
    const tournament = ref<TournamentState | null>(null);
    const totalMedals = ref(0);

    function startTournament(
      selectedTables: number[],
      playerTeamName: string,
      playerClubId: number,
    ) {
      if (selectedTables.length < 3) {
        throw new Error("Need at least 3 tables for tournament");
      }

      // Generate opponents for group stage (3 matches)
      // Opponents are chosen from the selected tables
      const shuffledTables = [...selectedTables].sort(
        () => Math.random() - 0.5,
      );
      const groupMatches: TournamentMatch[] = [];

      for (let i = 0; i < 3; i++) {
        const opponentTable = shuffledTables[i % shuffledTables.length];
        const opponentClubId = TABLE_TO_CLUB_MAPPING[opponentTable] || 180;

        groupMatches.push({
          id: `group-${i}`,
          phase: "group",
          opponentClubId,
          completed: false,
          tables: selectedTables,
        });
      }

      tournament.value = {
        selectedTables,
        currentPhase: "group",
        matches: groupMatches,
        currentMatchIndex: 0,
        isActive: true,
        victories: 0,
        defeats: 0,
        playerTeamName,
        playerClubId,
      };
    }

    function resetTournament() {
      tournament.value = null;
    }

    /**
     * Finalizes the current active tournament match using the provided scores.
     *
     * Marks the current match as completed, records `playerScore` and `opponentScore`, increments the tournament's victory or defeat counters, and either advances the tournament phase when all matches in the current phase are completed or advances to the next match index. If there is no active tournament, no current match, or the current match is already completed, the function has no effect.
     *
     * @param playerScore - The player's score for the match
     * @param opponentScore - The opponent's score for the match
     */
    function completeMatch(playerScore: number, opponentScore: number) {
      if (!tournament.value) return;
      if (!tournament.value.isActive) return; // Guard against inactive tournament
      
      const currentMatch =
        tournament.value.matches[tournament.value.currentMatchIndex];
      
      // Guard against missing or out of bounds match
      if (!currentMatch) return;
      
      // Guard against double completion
      if (currentMatch.completed) return;
      
      currentMatch.completed = true;
      currentMatch.playerScore = playerScore;
      currentMatch.opponentScore = opponentScore;

      if (playerScore > opponentScore) {
        tournament.value.victories++;
      } else {
        tournament.value.defeats++;
      }

      // Check if we should advance to next phase
      const currentPhaseMatches = tournament.value.matches.filter(
        (m) => m.phase === tournament.value!.currentPhase,
      );
      const allCompleted = currentPhaseMatches.every((m) => m.completed);

      if (allCompleted) {
        advancePhase();
      } else {
        tournament.value.currentMatchIndex++;
      }
    }

    function advancePhase() {
      if (!tournament.value) return;

      const phaseOrder: TournamentPhase[] = [
        "group",
        "quarter",
        "semi",
        "final",
      ];
      const currentPhaseIndex = phaseOrder.indexOf(
        tournament.value.currentPhase,
      );

      // Check if player qualified (at least 2 wins in group stage)
      if (tournament.value.currentPhase === "group") {
        if (tournament.value.victories < 2) {
          // Eliminated
          tournament.value.isActive = false;
          return;
        }
      }

      // Check if tournament is over
      if (tournament.value.currentPhase === "final") {
        tournament.value.isActive = false;
        return;
      }

      // Advance to next phase
      const nextPhase = phaseOrder[currentPhaseIndex + 1];
      tournament.value.currentPhase = nextPhase;

      // Generate next match - pick random opponent from selected tables
      const selectedTables = tournament.value.selectedTables;
      const randomTable =
        selectedTables[Math.floor(Math.random() * selectedTables.length)];
      const opponentClubId = TABLE_TO_CLUB_MAPPING[randomTable] || 180;

      tournament.value.matches.push({
        id: `${nextPhase}-0`,
        phase: nextPhase,
        opponentClubId,
        completed: false,
        tables: tournament.value.selectedTables,
      });

      tournament.value.currentMatchIndex = tournament.value.matches.length - 1;
    }

    const currentMatch = computed(() => {
      if (!tournament.value) return null;
      return tournament.value.matches[tournament.value.currentMatchIndex];
    });

    const isQualified = computed(() => {
      if (!tournament.value || tournament.value.currentPhase !== "group")
        return true;
      return tournament.value.victories >= 2;
    });

    const matchesByPhase = computed(() => {
      if (!tournament.value)
        return { group: [], quarter: [], semi: [], final: [] };

      return {
        group: tournament.value.matches.filter((m) => m.phase === "group"),
        quarter: tournament.value.matches.filter((m) => m.phase === "quarter"),
        semi: tournament.value.matches.filter((m) => m.phase === "semi"),
        final: tournament.value.matches.filter((m) => m.phase === "final"),
      };
    });

    /**
     * Clears the current tournament state and marks there as being no active tournament.
     */
    function endTournament() {
      tournament.value = null;
    }

    /**
     * Check that a numeric amount is greater than zero.
     *
     * Logs a warning including `functionName` if the value is not greater than zero.
     *
     * @param amount - The numeric value to validate
     * @param functionName - Caller name included in the warning message when validation fails
     * @returns `true` if `amount` is greater than zero, `false` otherwise
     */
    function validatePositiveAmount(amount: number, functionName: string): boolean {
      if (amount <= 0) {
        console.warn(`${functionName}: amount must be positive, received:`, amount);
        return false;
      }
      return true;
    }

    /**
     * Increase the stored medal balance by the specified positive amount.
     *
     * @param amount - The number of medals to add; must be greater than zero. Non-positive values are ignored.
     */
    function addMedals(amount: number) {
      if (!validatePositiveAmount(amount, 'addMedals')) {
        return;
      }
      totalMedals.value += amount;
    }

    /**
     * Attempt to deduct a positive number of medals from the store balance.
     *
     * @param amount - The number of medals to spend; must be greater than zero.
     * @returns `true` if the store had enough medals and the amount was deducted, `false` otherwise.
     */
    function spendMedals(amount: number): boolean {
      if (!validatePositiveAmount(amount, 'spendMedals')) {
        return false;
      }
      if (totalMedals.value >= amount) {
        totalMedals.value -= amount;
        return true;
      }
      return false;
    }

    return {
      tournament,
      totalMedals,
      currentMatch,
      isQualified,
      matchesByPhase,
      startTournament,
      completeMatch,
      endTournament,
      resetTournament,
      addMedals,
      spendMedals,
    };
  },
  {
    persist: true,
  },
);
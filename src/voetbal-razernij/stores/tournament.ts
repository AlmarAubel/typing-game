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

    function endTournament() {
      tournament.value = null;
    }

    function addMedals(amount: number) {
      if (amount <= 0) {
        console.warn('addMedals: amount must be positive, received:', amount);
        return;
      }
      totalMedals.value += amount;
    }

    function spendMedals(amount: number): boolean {
      if (amount <= 0) {
        console.warn('spendMedals: amount must be positive, received:', amount);
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

import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Player, PlayerCard, TeamSlot } from "../utils/football-data";
import { FootballDataService } from "../utils/football-data";
import { BALANCE_CONFIG, TABLE_TO_CLUB_MAPPING } from "../utils/balance-config";

export interface GameSession {
  tableNumber: number;
  activeTables: number[];
  clubId: number | null; // Null if it's a mix of clubs (e.g. tournament)
  startTime: Date;
  endTime?: Date;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  currentStreak: number;
  bestStreak: number;
  coinsEarned: number;
  xpEarned: number;
  tokensEarned: number;
  isActive: boolean;
}

export interface ClubProgress {
  clubId: number;
  totalXP: number;
  totalTokens: number;
  unlockedPacks: Array<"bronze" | "silver" | "gold">;
  totalGamesPlayed: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
}

export interface Collection {
  playerCards: Record<number, PlayerCard>;
  totalCards: number;
  completedClubs: number[];
}

export interface Team {
  name: string;
  slots: TeamSlot[];
  totalRating: number;
  createdAt: Date;
}

export interface BattleSession {
  opponentClubId: number;
  activeTables: number[]; // Which tables are used for questions
  playerScore: number;
  opponentScore: number;
  startTime: Date;
  matchMinutes: number; // 0-90
  possession: "player" | "opponent";
  history: string[]; // Commentary log
  isActive: boolean;
  rewards: { coins: number; xp: number };
}

import { useStaffStore } from "./staff";

// Main game store for session management and scoring
export const useVoetbalGameStore = defineStore(
  "voetbal-game",
  () => {
    // Session state
    const currentSession = ref<GameSession | null>(null);
    const currentBattle = ref<BattleSession | null>(null);
    const sessionHistory = ref<GameSession[]>([]);
    const currentTime = ref<number>(Date.now()); // Reactive time reference for timer updates

    // Game statistics
    const totalCoins = ref(0);
    const globalStats = ref({
      totalGamesPlayed: 0,
      totalQuestionsAnswered: 0,
      totalCorrectAnswers: 0,
      bestOverallStreak: 0,
      totalTimePlayedMinutes: 0,
    });

    // Timer interval
    let timerInterval: ReturnType<typeof setInterval> | null = null;

    function startTimer() {
      stopTimer(); // Clear any existing timer
      timerInterval = setInterval(() => {
        currentTime.value = Date.now();
      }, 1000);
    }

    function stopTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    /**
     * Creates and starts a new game session for one or more table numbers.
     *
     * @param tableNumberOrTables - A single table number or an array of table numbers to start the session for.
     *   If an array is provided it must be non-empty; the first element is used as the primary table.
     * @returns The initialized GameSession object with timestamps, counters, rewards, and `isActive` set to true.
     *   The session's `clubId` is set to the common mapped club if all provided tables map to the same defined club, otherwise `null`.
     * @throws Error - If an empty array is provided for `tableNumberOrTables`.
     */
    function startSession(tableNumberOrTables: number | number[]): GameSession {
      let tableNumber: number;
      let activeTables: number[];

      if (Array.isArray(tableNumberOrTables)) {
        if (tableNumberOrTables.length === 0) {
          throw new Error("Cannot start session with empty tables array");
        }
        activeTables = tableNumberOrTables;
        tableNumber = activeTables[0]; // Primary table for now
      } else {
        tableNumber = tableNumberOrTables;
        activeTables = [tableNumber];
      }

      // Compute clubId by checking if all tables map to the same club
      const mappedClubs = activeTables.map(t => TABLE_TO_CLUB_MAPPING[t]);
      const firstClub = mappedClubs[0];
      // All tables must map to the same club AND that club must be defined
      const allSameClub = firstClub !== undefined && mappedClubs.every(club => club === firstClub);
      const clubId = allSameClub ? firstClub : null;

      const session: GameSession = {
        tableNumber,
        activeTables,
        clubId,
        startTime: new Date(),
        questionsAnswered: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        currentStreak: 0,
        bestStreak: 0,
        coinsEarned: 0,
        xpEarned: 0,
        tokensEarned: 0,
        isActive: true,
      };

      currentSession.value = session;
      startTimer(); // Start the timer for reactive updates
      return session;
    }

    function startBattle(opponentClubId: number, activeTables: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]): BattleSession {
      const battle: BattleSession = {
        opponentClubId,
        activeTables,
        playerScore: 0,
        opponentScore: 0,
        startTime: new Date(),
        matchMinutes: 0,
        possession: "player", // Home team starts?
        history: ["De wedstrijd is begonnen!"],
        isActive: true,
        rewards: { coins: 0, xp: 0 },
      };

      currentBattle.value = battle;
      // We don't use the regular session timer for battles, battle uses discrete time steps per question
      return battle;
    }

    function endBattle() {
      if (!currentBattle.value) return;
      currentBattle.value.isActive = false;
      // Awards coin logic here?
      totalCoins.value += currentBattle.value.rewards.coins;
      // XP logic would go to club progress, but which club? Maybe general XP?
    }

    function endSession(): GameSession | null {
      if (!currentSession.value) return null;

      const session = currentSession.value;
      session.endTime = new Date();
      session.isActive = false;

      stopTimer(); // Stop the timer when session ends

      // Calculate session-end bonuses
      const { sessionEndBonus } = BALANCE_CONFIG.tokens;

      if (session.questionsAnswered >= sessionEndBonus.minimumQuestions) {
        // Activity bonus
        session.tokensEarned += sessionEndBonus.activityTokens;

        // Accuracy bonus
        const accuracy =
          (session.correctAnswers / session.questionsAnswered) * 100;
        if (accuracy >= sessionEndBonus.accuracyThreshold) {
          session.tokensEarned += sessionEndBonus.accuracyTokens;
        }
      }

      // Update global stats
      totalCoins.value += session.coinsEarned;
      globalStats.value.totalGamesPlayed++;
      globalStats.value.totalQuestionsAnswered += session.questionsAnswered;
      globalStats.value.totalCorrectAnswers += session.correctAnswers;
      globalStats.value.bestOverallStreak = Math.max(
        globalStats.value.bestOverallStreak,
        session.bestStreak,
      );

      const sessionDuration =
        (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
      globalStats.value.totalTimePlayedMinutes += sessionDuration;

      // Add to history
      sessionHistory.value.push({ ...session });

      // Update club progress
      const clubStore = useClubProgressStore();
      clubStore.addSessionProgress(session);

      // Reset current session
      currentSession.value = null;

      return session;
    }

    function answerQuestion(isCorrect: boolean): void {
      if (!currentSession.value || !currentSession.value.isActive) return;

      const session = currentSession.value;
      session.questionsAnswered++;

      // Apply Head Coach XP Bonus
      const staffStore = useStaffStore();
      const xpMultiplier =
        1 + (staffStore.hasStaff("head_coach") ? 0.1 : 0);

      if (isCorrect) {
        session.correctAnswers++;
        session.currentStreak++;
        session.bestStreak = Math.max(
          session.bestStreak,
          session.currentStreak,
        );
        session.coinsEarned += BALANCE_CONFIG.scoring.correctAnswerCoins;
        session.xpEarned += Math.round(
          BALANCE_CONFIG.scoring.correctAnswerXP * xpMultiplier,
        );
      } else {
        session.incorrectAnswers++;
        session.currentStreak = 0;
        session.coinsEarned += BALANCE_CONFIG.scoring.incorrectAnswerCoins;
        session.xpEarned += Math.round(
          BALANCE_CONFIG.scoring.incorrectAnswerXP * xpMultiplier,
        );
      }

      // Calculate token rewards
      calculateTokenRewards(session);
    }

    function calculateTokenRewards(session: GameSession): void {
      const { inspanningsBonus, streakBonuses } = BALANCE_CONFIG.tokens;
      let newTokens = 0;

      // Effort-based tokens (every 5 questions)
      if (
        session.questionsAnswered % inspanningsBonus.questionsPerToken ===
        0
      ) {
        newTokens += inspanningsBonus.tokenReward;
      }

      // Streak bonuses
      if (session.currentStreak === 3) {
        newTokens += streakBonuses.streak3;
      } else if (session.currentStreak === 5) {
        newTokens += streakBonuses.streak5;
      } else if (
        session.currentStreak > 5 &&
        session.currentStreak % streakBonuses.streakMilestone === 0
      ) {
        newTokens += 1;
      }

      session.tokensEarned += newTokens;
    }

    // Computed properties
    const isSessionActive = computed(
      () => currentSession.value?.isActive ?? false,
    );
    const sessionTimeRemaining = computed(() => {
      if (!currentSession.value) return 0;
      // Use currentTime.value to make this reactive
      // Ensure startTime is a Date object (handle deserialization from localStorage)
      const startTime =
        currentSession.value.startTime instanceof Date
          ? currentSession.value.startTime
          : new Date(currentSession.value.startTime);
      const elapsed = (currentTime.value - startTime.getTime()) / 1000;
      const totalTime = BALANCE_CONFIG.session.durationMinutes * 60;
      return Math.max(0, totalTime - elapsed);
    });

    return {
      // State
      currentSession,
      currentBattle,
      sessionHistory,
      totalCoins,
      globalStats,

      // Getters
      isSessionActive,
      sessionTimeRemaining,

      // Actions
      startSession,
      startBattle,
      endBattle,
      endSession,
      answerQuestion,
    };
  },
  {
    persist: true,
  },
);

// Club progress store for XP, tokens, and unlocks per club
export const useClubProgressStore = defineStore(
  "voetbal-club-progress",
  () => {
    const clubProgress = ref<Record<number, ClubProgress>>({});

    function getClubProgress(clubId: number): ClubProgress {
      if (!clubProgress.value[clubId]) {
        clubProgress.value[clubId] = {
          clubId,
          totalXP: 0,
          totalTokens: 0,
          unlockedPacks: ["bronze"],
          totalGamesPlayed: 0,
          totalQuestionsAnswered: 0,
          totalCorrectAnswers: 0,
        };
      }
      return clubProgress.value[clubId];
    }

    function addSessionProgress(session: GameSession): void {
      // If clubId is null (tournament mode), we might distribute XP differently
      // For now, let's just skip updating specific club progress if no single club set
      if (!session.clubId) {
        // TODO: Implement tournament XP logic (maybe distribute to all activeTables?)
        return;
      }

      const progress = getClubProgress(session.clubId);

      progress.totalXP += session.xpEarned;
      progress.totalTokens += session.tokensEarned;
      progress.totalGamesPlayed++;
      progress.totalQuestionsAnswered += session.questionsAnswered;
      progress.totalCorrectAnswers += session.correctAnswers;

      // Check for pack unlocks
      const { packs } = BALANCE_CONFIG;
      const unlockedPacks = progress.unlockedPacks;

      if (
        progress.totalXP >= packs.silver.unlockXP &&
        !unlockedPacks.includes("silver")
      ) {
        progress.unlockedPacks.push("silver");
      }
      if (
        progress.totalXP >= packs.gold.unlockXP &&
        !unlockedPacks.includes("gold")
      ) {
        progress.unlockedPacks.push("gold");
      }
    }

    function spendTokens(clubId: number, amount: number): boolean {
      const progress = getClubProgress(clubId);
      if (progress.totalTokens >= amount) {
        progress.totalTokens -= amount;
        return true;
      }
      return false;
    }

    const getAllClubProgress = computed(() =>
      Object.values(clubProgress.value),
    );

    return {
      clubProgress,
      getClubProgress,
      addSessionProgress,
      spendTokens,
      getAllClubProgress,
    };
  },
  {
    persist: true,
  },
);

// Collection store for managing player cards
export const useCollectionStore = defineStore(
  "voetbal-collection",
  () => {
    const playerCards = ref<Record<number, PlayerCard>>({});
    const collectionStats = ref({
      totalCardsOwned: 0,
      totalUniquePlayers: 0,
      completedClubs: [] as number[],
    });

    function addPlayerCard(player: Player): PlayerCard {
      // Safety check for valid player
      if (!player || !player.id) {
        throw new Error("Invalid player provided to addPlayerCard");
      }

      const existingCard = playerCards.value[player.id];

      if (existingCard) {
        existingCard.copies++;
        return existingCard;
      } else {
        const newCard: PlayerCard = {
          ...player,
          copies: 1,
          firstObtained: new Date(),
        };
        playerCards.value[player.id] = newCard;

        // Update stats
        collectionStats.value.totalUniquePlayers++;
        updateCollectionStats();

        return newCard;
      }
    }

    function updateCollectionStats(): void {
      const cards = Object.values(playerCards.value);
      collectionStats.value.totalCardsOwned = cards.reduce(
        (sum, card) => sum + card.copies,
        0,
      );

      // Check for completed clubs (all players from a club collected)
      const clubCounts = new Map<number, { owned: number; total: number }>();

      // Only update club completion if FootballDataService is initialized
      if (FootballDataService.isInitialized()) {
        FootballDataService.getAllClubs().forEach((club) => {
          const clubPlayers = FootballDataService.getPlayersByClub(club.id);
          const ownedPlayers = cards.filter(
            (card) => card.clubId === club.id,
          ).length;

          clubCounts.set(club.id, {
            owned: ownedPlayers,
            total: clubPlayers.length,
          });

          if (ownedPlayers === clubPlayers.length && clubPlayers.length > 0) {
            if (!collectionStats.value.completedClubs.includes(club.id)) {
              collectionStats.value.completedClubs.push(club.id);
            }
          }
        });
      }
    }

    function getPlayersByClub(clubId: number): PlayerCard[] {
      return Object.values(playerCards.value).filter(
        (card) => card.clubId === clubId,
      );
    }

    function getPlayersByPosition(position: string): PlayerCard[] {
      return Object.values(playerCards.value).filter(
        (card) => card.position === position,
      );
    }

    function getPlayersByRarity(rarity: string): PlayerCard[] {
      return Object.values(playerCards.value).filter(
        (card) => card.rarity === rarity,
      );
    }

    const allPlayerCards = computed(() => Object.values(playerCards.value));
    const collectionCompletion = computed(() => {
      if (!FootballDataService.isInitialized()) {
        return 0;
      }
      const totalPossiblePlayers = FootballDataService.getAllPlayers().length;
      return totalPossiblePlayers > 0
        ? (collectionStats.value.totalUniquePlayers / totalPossiblePlayers) *
            100
        : 0;
    });

    return {
      playerCards,
      collectionStats,
      addPlayerCard,
      getPlayersByClub,
      getPlayersByPosition,
      getPlayersByRarity,
      allPlayerCards,
      collectionCompletion,
    };
  },
  {
    persist: true,
  },
);

// Team builder store
export const useTeamStore = defineStore(
  "voetbal-team",
  () => {
    const currentTeam = ref<Team | null>(null);
    const savedTeams = ref<Team[]>([]);

    function createNewTeam(name: string): Team {
      const { formation } = BALANCE_CONFIG.team;
      const slots: TeamSlot[] = [];

      let slotNumber = 1;

      // Create slots based on formation
      for (let i = 0; i < formation.keepers; i++) {
        slots.push({ position: "K", slotNumber: slotNumber++ });
      }
      for (let i = 0; i < formation.defenders; i++) {
        slots.push({ position: "D", slotNumber: slotNumber++ });
      }
      for (let i = 0; i < formation.midfielders; i++) {
        slots.push({ position: "M", slotNumber: slotNumber++ });
      }
      for (let i = 0; i < formation.attackers; i++) {
        slots.push({ position: "A", slotNumber: slotNumber++ });
      }

      const team: Team = {
        name,
        slots,
        totalRating: 0,
        createdAt: new Date(),
      };

      currentTeam.value = team;
      return team;
    }

    function setPlayerInSlot(slotNumber: number, playerId: number): boolean {
      if (!currentTeam.value || !FootballDataService.isInitialized())
        return false;

      const slot = currentTeam.value.slots.find(
        (s) => s.slotNumber === slotNumber,
      );
      if (!slot) return false;

      const player = FootballDataService.getPlayerById(playerId);
      if (!player || player.position !== slot.position) return false;

      // Check if player is already in team
      const existingSlot = currentTeam.value.slots.find(
        (s) => s.playerId === playerId,
      );
      if (existingSlot) return false;

      slot.playerId = playerId;
      calculateTeamRating();
      return true;
    }

    function removePlayerFromSlot(slotNumber: number): void {
      if (!currentTeam.value) return;

      const slot = currentTeam.value.slots.find(
        (s) => s.slotNumber === slotNumber,
      );
      if (slot) {
        slot.playerId = undefined;
        calculateTeamRating();
      }
    }

    function calculateTeamRating(): void {
      if (!currentTeam.value || !FootballDataService.isInitialized()) return;

      let totalRating = 0;
      let playersCount = 0;

      currentTeam.value.slots.forEach((slot) => {
        if (slot.playerId) {
          const player = FootballDataService.getPlayerById(slot.playerId);
          if (player) {
            totalRating += player.rating;
            playersCount++;
          }
        }
      });

      currentTeam.value.totalRating =
        playersCount > 0 ? Math.round(totalRating / playersCount) : 0;
    }

    function saveCurrentTeam(): void {
      if (currentTeam.value) {
        const existingIndex = savedTeams.value.findIndex(
          (team) => team.name === currentTeam.value!.name,
        );
        if (existingIndex >= 0) {
          savedTeams.value[existingIndex] = { ...currentTeam.value };
        } else {
          savedTeams.value.push({ ...currentTeam.value });
        }
      }
    }

    function loadTeam(teamName: string): void {
      const team = savedTeams.value.find((t) => t.name === teamName);
      if (team) {
        currentTeam.value = { ...team };
      }
    }

    const isTeamComplete = computed(() => {
      if (!currentTeam.value) return false;
      return currentTeam.value.slots.every(
        (slot) => slot.playerId !== undefined,
      );
    });

    const teamStrengthByPosition = computed(() => {
      if (!currentTeam.value) return {};

      const positions = { K: 0, D: 0, M: 0, A: 0 };
      const counts = { K: 0, D: 0, M: 0, A: 0 };

      currentTeam.value.slots.forEach((slot) => {
        if (slot.playerId) {
          const player = FootballDataService.getPlayerById(slot.playerId);
          if (player) {
            positions[slot.position] += player.rating;
            counts[slot.position]++;
          }
        }
      });

      return {
        K: counts.K > 0 ? Math.round(positions.K / counts.K) : 0,
        D: counts.D > 0 ? Math.round(positions.D / counts.D) : 0,
        M: counts.M > 0 ? Math.round(positions.M / counts.M) : 0,
        A: counts.A > 0 ? Math.round(positions.A / counts.A) : 0,
      };
    });

    return {
      currentTeam,
      savedTeams,
      createNewTeam,
      setPlayerInSlot,
      removePlayerFromSlot,
      saveCurrentTeam,
      loadTeam,
      isTeamComplete,
      teamStrengthByPosition,
    };
  },
  {
    persist: true,
  },
);
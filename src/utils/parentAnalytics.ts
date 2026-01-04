// Parent Analytics Utility voor Tafel Razernij
// Tracks progress en difficulty areas voor ouders

export interface TableStatistic {
  table: number;
  operation: "multiplication" | "division" | "mixed";
  totalAttempts: number;
  correctAttempts: number;
  averageResponseTime: number; // in milliseconds
  lastPracticed: Date;
  difficultyScore: number; // 0-100, lower = needs more practice
  streakRecord: number;
  recentPerformance: boolean[]; // last 10 attempts
}

export interface SessionData {
  startTime: Date;
  endTime: Date;
  totalProblems: number;
  correctAnswers: number;
  totalPoints: number;
  averageTime: number;
  tablesUsed: number[];
  gameMode: "multiple-choice" | "open-input" | "mixed";
}

export interface ParentAnalytics {
  tableStats: { [key: string]: TableStatistic }; // key: "table-operation" e.g. "5-multiplication"
  weeklyProgress: SessionData[];
  achievements: Achievement[];
  preferences: {
    preferredDifficulty: "easy" | "medium" | "hard";
    favoriteOperations: ("multiplication" | "division")[];
    averageSessionTime: number;
  };
  recommendations: {
    tablesToPractice: number[];
    suggestedDifficulty: "easy" | "medium" | "hard";
    optimalSessionLength: number; // in minutes
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedAt: Date;
  type: "streak" | "accuracy" | "speed" | "dedication" | "special";
  icon: string;
}

const STORAGE_KEY = "typegame-parent-analytics";
const MAX_RECENT_PERFORMANCE = 10;
const ACHIEVEMENT_DEFINITIONS = [
  {
    id: "first-perfect",
    name: "Perfectionist",
    description: "10 juiste antwoorden op rij",
    type: "streak",
    icon: "⭐",
  },
  {
    id: "speed-demon",
    name: "Snelheidsduivel",
    description: "Antwoord binnen 3 seconden",
    type: "speed",
    icon: "⚡",
  },
  {
    id: "table-master",
    name: "Tafelmeester",
    description: "Alle tafels van 1-10 geoefend",
    type: "dedication",
    icon: "🏆",
  },
  {
    id: "accuracy-ace",
    name: "Nauwkeurigheid Kampioen",
    description: "95% juist in een sessie",
    type: "accuracy",
    icon: "🎯",
  },
  {
    id: "daily-grind",
    name: "Dagelijkse Oefening",
    description: "7 dagen achter elkaar geoefend",
    type: "dedication",
    icon: "📅",
  },
  {
    id: "point-collector",
    name: "Punten Verzamelaar",
    description: "1000 punten verzameld",
    type: "special",
    icon: "💎",
  },
];

export class ParentAnalyticsManager {
  private analytics: ParentAnalytics;

  constructor() {
    this.analytics = this.loadAnalytics();
  }

  // Record a single table problem attempt
  recordAttempt(
    table: number,
    operation: "multiplication" | "division",
    correct: boolean,
    responseTime: number,
  ) {
    const key = `${table}-${operation}`;
    const stat =
      this.analytics.tableStats[key] ||
      this.createNewTableStat(table, operation);

    // Update basic stats
    stat.totalAttempts++;
    if (correct) stat.correctAttempts++;

    // Update average response time (exponential moving average)
    stat.averageResponseTime = stat.averageResponseTime
      ? stat.averageResponseTime * 0.8 + responseTime * 0.2
      : responseTime;

    // Update recent performance
    stat.recentPerformance.push(correct);
    if (stat.recentPerformance.length > MAX_RECENT_PERFORMANCE) {
      stat.recentPerformance.shift();
    }

    // Update difficulty score (0-100, based on recent performance)
    const recentCorrect = stat.recentPerformance.filter((x) => x).length;
    const recentTotal = stat.recentPerformance.length;
    stat.difficultyScore = Math.round((recentCorrect / recentTotal) * 100);

    // Update last practiced
    stat.lastPracticed = new Date();

    this.analytics.tableStats[key] = stat;
    this.saveAnalytics();
  }

  // Start a new practice session
  startSession(gameMode: "multiple-choice" | "open-input" | "mixed"): string {
    const sessionId = Date.now().toString();
    const session: SessionData = {
      startTime: new Date(),
      endTime: new Date(), // Will be updated when session ends
      totalProblems: 0,
      correctAnswers: 0,
      totalPoints: 0,
      averageTime: 0,
      tablesUsed: [],
      gameMode,
    };

    localStorage.setItem(`session-${sessionId}`, JSON.stringify(session));
    return sessionId;
  }

  // End practice session and record results
  endSession(
    sessionId: string,
    results: {
      totalProblems: number;
      correctAnswers: number;
      totalPoints: number;
      averageTime: number;
      tablesUsed: number[];
    },
  ) {
    try {
      console.log("Ending session:", sessionId, results);
      const sessionData = localStorage.getItem(`session-${sessionId}`);

      if (!sessionData) {
        console.warn(`Session ${sessionId} not found in localStorage`);
        // Create a new session data if not found
        const session: SessionData = {
          startTime: new Date(),
          endTime: new Date(),
          totalProblems: results.totalProblems,
          correctAnswers: results.correctAnswers,
          totalPoints: results.totalPoints,
          averageTime: results.averageTime,
          tablesUsed: results.tablesUsed,
          gameMode: "open-input", // default value
        };

        console.log("Created new session data:", session);

        // Add to weekly progress (keep last 30 sessions)
        this.analytics.weeklyProgress.push(session);
        if (this.analytics.weeklyProgress.length > 30) {
          this.analytics.weeklyProgress.shift();
        }

        console.log(
          "Weekly progress updated, total sessions:",
          this.analytics.weeklyProgress.length,
        );

        // Check for achievements
        this.checkAchievements(session);

        // Update recommendations
        this.updateRecommendations();

        // Save analytics
        this.saveAnalytics();
        return;
      }

      const session: SessionData = JSON.parse(sessionData);
      session.endTime = new Date();
      session.totalProblems = results.totalProblems;
      session.correctAnswers = results.correctAnswers;
      session.totalPoints = results.totalPoints;
      session.averageTime = results.averageTime;
      session.tablesUsed = results.tablesUsed;

      console.log("Ending session:", sessionId, session);

      // Add to weekly progress (keep last 30 sessions)
      this.analytics.weeklyProgress.push(session);
      if (this.analytics.weeklyProgress.length > 30) {
        this.analytics.weeklyProgress.shift();
      }

      console.log(
        "Weekly progress updated, total sessions:",
        this.analytics.weeklyProgress.length,
      );

      // Check for achievements
      this.checkAchievements(session);

      // Update recommendations
      this.updateRecommendations();

      // Save analytics
      this.saveAnalytics();

      // Cleanup session storage
      localStorage.removeItem(`session-${sessionId}`);
    } catch (error) {
      console.error("Error ending session:", error, sessionId);
    }
  }

  // Get tables that need more practice (lowest difficulty scores)
  getTablesNeedingPractice(limit: number = 3): TableStatistic[] {
    return Object.values(this.analytics.tableStats)
      .sort((a, b) => a.difficultyScore - b.difficultyScore)
      .slice(0, limit);
  }

  // Get overall progress summary
  getProgressSummary() {
    const allStats = Object.values(this.analytics.tableStats);
    const totalAttempts = allStats.reduce(
      (sum, stat) => sum + stat.totalAttempts,
      0,
    );
    const totalCorrect = allStats.reduce(
      (sum, stat) => sum + stat.correctAttempts,
      0,
    );
    const overallAccuracy =
      totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0;

    // Tables practiced (1-10)
    const tablesPracticed = new Set();
    allStats.forEach((stat) => tablesPracticed.add(stat.table));

    // Recent sessions (last 7 days)
    const recentSessions = this.analytics.weeklyProgress.filter((session) => {
      const sessionDate = new Date(session.startTime);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return sessionDate > weekAgo;
    });

    const totalSessionTime = recentSessions.reduce((sum, session) => {
      return (
        sum +
        (new Date(session.endTime).getTime() -
          new Date(session.startTime).getTime())
      );
    }, 0);

    return {
      overallAccuracy: Math.round(overallAccuracy),
      tablesPracticed: Array.from(tablesPracticed).sort(),
      totalTablesPracticed: tablesPracticed.size,
      recentSessions: recentSessions.length,
      averageSessionTime:
        recentSessions.length > 0
          ? Math.round(totalSessionTime / recentSessions.length / 1000 / 60) // minutes
          : 0,
      achievements: this.analytics.achievements.length,
      recommendedPractice: this.getTablesNeedingPractice().map(
        (stat) => stat.table,
      ),
    };
  }

  // Get detailed analytics for parent view
  getDetailedAnalytics() {
    return {
      ...this.analytics,
      progressSummary: this.getProgressSummary(),
    };
  }

  // Reset analytics (for testing or fresh start)
  resetAnalytics() {
    this.analytics = {
      tableStats: {},
      weeklyProgress: [],
      achievements: [],
      preferences: {
        preferredDifficulty: "medium",
        favoriteOperations: ["multiplication"],
        averageSessionTime: 10,
      },
      recommendations: {
        tablesToPractice: [1, 2, 3],
        suggestedDifficulty: "medium",
        optimalSessionLength: 10,
      },
    };
    this.saveAnalytics();
  }

  private createNewTableStat(
    table: number,
    operation: "multiplication" | "division",
  ): TableStatistic {
    return {
      table,
      operation,
      totalAttempts: 0,
      correctAttempts: 0,
      averageResponseTime: 0,
      lastPracticed: new Date(),
      difficultyScore: 50, // neutral start
      streakRecord: 0,
      recentPerformance: [],
    };
  }

  private checkAchievements(session: SessionData) {
    ACHIEVEMENT_DEFINITIONS.forEach((achievement) => {
      // Skip if already unlocked
      if (this.analytics.achievements.some((a) => a.id === achievement.id))
        return;

      let unlocked = false;

      switch (achievement.id) {
        case "first-perfect":
          // Check for 10 correct in a row (would need streak tracking in session)
          if (
            session.correctAnswers >= 10 &&
            session.correctAnswers === session.totalProblems
          ) {
            unlocked = true;
          }
          break;

        case "speed-demon":
          // Check for fast average time
          if (session.averageTime < 3000) {
            // 3 seconds
            unlocked = true;
          }
          break;

        case "table-master":
          // Check if all tables 1-10 have been practiced
          const tablesPracticed = new Set();
          Object.values(this.analytics.tableStats).forEach((stat) =>
            tablesPracticed.add(stat.table),
          );
          if (tablesPracticed.size >= 10) {
            unlocked = true;
          }
          break;

        case "accuracy-ace":
          // Check for 95% accuracy in session
          if (
            session.totalProblems > 0 &&
            session.correctAnswers / session.totalProblems >= 0.95
          ) {
            unlocked = true;
          }
          break;

        case "daily-grind":
          // Check for 7 consecutive days (would need more sophisticated tracking)
          const recentSessions = this.analytics.weeklyProgress.slice(-7);
          if (recentSessions.length >= 7) {
            unlocked = true;
          }
          break;

        case "point-collector":
          // Check total points across all sessions
          const totalPoints = this.analytics.weeklyProgress.reduce(
            (sum, s) => sum + s.totalPoints,
            0,
          );
          if (totalPoints >= 1000) {
            unlocked = true;
          }
          break;
      }

      if (unlocked) {
        this.analytics.achievements.push({
          id: achievement.id,
          name: achievement.name,
          description: achievement.description,
          unlockedAt: new Date(),
          type: achievement.type as Achievement["type"],
          icon: achievement.icon,
        });
      }
    });
  }

  private updateRecommendations() {
    const needsPractice = this.getTablesNeedingPractice(5);

    // Recommend tables with lowest scores
    this.analytics.recommendations.tablesToPractice = needsPractice.map(
      (stat) => stat.table,
    );

    // Suggest difficulty based on overall performance
    const avgDifficulty =
      Object.values(this.analytics.tableStats).reduce(
        (sum, stat) => sum + stat.difficultyScore,
        0,
      ) / Object.keys(this.analytics.tableStats).length;

    if (avgDifficulty > 80) {
      this.analytics.recommendations.suggestedDifficulty = "hard";
    } else if (avgDifficulty > 60) {
      this.analytics.recommendations.suggestedDifficulty = "medium";
    } else {
      this.analytics.recommendations.suggestedDifficulty = "easy";
    }

    // Recommend session length based on recent performance
    const recentSessions = this.analytics.weeklyProgress.slice(-5);
    if (recentSessions.length > 0) {
      const avgSessionTime =
        recentSessions.reduce((sum, session) => {
          const duration =
            new Date(session.endTime).getTime() -
            new Date(session.startTime).getTime();
          return sum + duration / 1000 / 60; // minutes
        }, 0) / recentSessions.length;

      this.analytics.recommendations.optimalSessionLength =
        Math.round(avgSessionTime);
    }
  }

  private loadAnalytics(): ParentAnalytics {
    console.log("Loading analytics from localStorage...");
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log("Stored data:", stored);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log("Parsed data:", parsed);

        // Convert date strings back to Date objects
        if (parsed.weeklyProgress) {
          parsed.weeklyProgress = parsed.weeklyProgress.map((session: Partial<SessionData>) => ({
            ...session,
            startTime: new Date(session.startTime as Date),
            endTime: new Date(session.endTime as Date),
          }));
        }

        if (parsed.tableStats) {
          Object.keys(parsed.tableStats).forEach((key) => {
            if (parsed.tableStats[key].lastPracticed) {
              parsed.tableStats[key].lastPracticed = new Date(
                parsed.tableStats[key].lastPracticed,
              );
            }
          });
        }

        if (parsed.achievements) {
          parsed.achievements = parsed.achievements.map((achievement: Partial<Achievement>) => ({
            ...achievement,
            unlockedAt: new Date(achievement.unlockedAt as Date),
          }));
        }

        console.log("Returning parsed analytics:", parsed);
        return parsed;
      } catch (error) {
        console.error("Error parsing stored analytics:", error);
      }
    }

    console.log("No stored data found, returning default analytics");
    // Return default analytics
    return {
      tableStats: {},
      weeklyProgress: [],
      achievements: [],
      preferences: {
        preferredDifficulty: "medium",
        favoriteOperations: ["multiplication"],
        averageSessionTime: 10,
      },
      recommendations: {
        tablesToPractice: [1, 2, 3],
        suggestedDifficulty: "medium",
        optimalSessionLength: 10,
      },
    };
  }

  private saveAnalytics() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.analytics));
    } catch (error) {
      console.error("Error saving analytics:", error);
    }
  }
}

// Singleton instance
export const parentAnalytics = new ParentAnalyticsManager();

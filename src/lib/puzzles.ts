"use client";

import { useState, useEffect } from "react";

interface Puzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  theme: string;
  description: string;
}

interface UserProgress {
  rating: number;
  solvedPuzzles: Set<string>;
  currentStreak: number;
  bestStreak: number;
  totalSolved: number;
}

// Puzzles de exemplo (podemos expandir isso muito mais)
const puzzles: Puzzle[] = [
  {
    id: "mate-in-1-basic",
    fen: "r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
    moves: ["h5f7"],
    rating: 800,
    theme: "mate-in-one",
    description: "Mate em 1 - Básico",
  },
  {
    id: "mate-in-2-basic",
    fen: "r1b1kb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P4/PPP2PPP/RNBQK1NR w KQkq - 0 1",
    moves: ["d1h5", "h5f7"],
    rating: 1000,
    theme: "mate-in-two",
    description: "Mate em 2 - Intermediário",
  },
  {
    id: "pin-tactic",
    fen: "rnbqkbnr/ppp2ppp/8/3pp3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1",
    moves: ["f3e5"],
    rating: 1200,
    theme: "pin",
    description: "Alfinete Tático",
  },
];

const defaultProgress: UserProgress = {
  rating: 800,
  solvedPuzzles: new Set<string>(),
  currentStreak: 0,
  bestStreak: 0,
  totalSolved: 0,
};

class PuzzleService {
  private userProgress: UserProgress;

  constructor(initialProgress: UserProgress = defaultProgress) {
    this.userProgress = initialProgress;
  }

  public getNextPuzzle(): Puzzle | null {
    const unsolvedPuzzles = puzzles.filter(
      (puzzle) => !this.userProgress.solvedPuzzles.has(puzzle.id)
    );

    if (unsolvedPuzzles.length === 0) return null;

    unsolvedPuzzles.sort(
      (a, b) =>
        Math.abs(a.rating - this.userProgress.rating) -
        Math.abs(b.rating - this.userProgress.rating)
    );

    return unsolvedPuzzles[0];
  }

  public submitPuzzleSolution(puzzleId: string, moves: string[]): boolean {
    const puzzle = puzzles.find((p) => p.id === puzzleId);
    if (!puzzle) return false;

    const isCorrect = this.areMovesSame(moves, puzzle.moves);

    if (isCorrect) {
      this.userProgress.solvedPuzzles.add(puzzleId);
      this.userProgress.currentStreak++;
      this.userProgress.totalSolved++;
      this.userProgress.bestStreak = Math.max(
        this.userProgress.bestStreak,
        this.userProgress.currentStreak
      );

      const ratingDiff = puzzle.rating - this.userProgress.rating;
      this.userProgress.rating += Math.floor(ratingDiff * 0.1) + 10;
    } else {
      this.userProgress.currentStreak = 0;
    }

    return isCorrect;
  }

  private areMovesSame(moves1: string[], moves2: string[]): boolean {
    if (moves1.length !== moves2.length) return false;
    return moves1.every((move, index) => move === moves2[index]);
  }

  public getUserProgress(): UserProgress {
    return {
      ...this.userProgress,
      solvedPuzzles: new Set(this.userProgress.solvedPuzzles),
    };
  }

  public resetProgress(): void {
    this.userProgress = { ...defaultProgress };
  }
}

export function usePuzzleService() {
  const [service, setService] = useState<PuzzleService | null>(null);

  useEffect(() => {
    const savedProgress = localStorage.getItem("puzzleProgress");
    let initialProgress = defaultProgress;

    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        initialProgress = {
          ...parsed,
          solvedPuzzles: new Set(parsed.solvedPuzzles),
        };
      } catch (error) {
        console.error("Erro ao carregar progresso:", error);
      }
    }

    const puzzleService = new PuzzleService(initialProgress);
    setService(puzzleService);

    return () => {
      // Salvar progresso ao desmontar
      if (puzzleService) {
        const progress = puzzleService.getUserProgress();
        localStorage.setItem(
          "puzzleProgress",
          JSON.stringify({
            ...progress,
            solvedPuzzles: Array.from(progress.solvedPuzzles),
          })
        );
      }
    };
  }, []);

  return service;
}

export type { Puzzle, UserProgress };

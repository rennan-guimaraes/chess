"use client";

import { useState, useEffect } from "react";
import puzzlesData from "@/data/puzzles.json";
import ChessGame from "./chess";

export interface Puzzle {
  PuzzleId: string;
  FEN: string;
  Moves: string;
  Rating: number;
  theme: string;
  Description: string;
}

export interface UserProgress {
  rating: number;
  solvedPuzzles: Set<string>;
  currentStreak: number;
  bestStreak: number;
  totalSolved: number;
  currentLevel: Level;
  currentPuzzleIndex: number;
}

interface LevelInfo {
  rating_min: number;
  rating_max: number;
  total_puzzles: number;
}

interface PuzzleLevel {
  info: LevelInfo;
  puzzles: Puzzle[];
}

const LEVELS = [
  "iniciante_1",
  "iniciante_2",
  "iniciante_3",
  "intermediario_1",
  "intermediario_2",
  "intermediario_3",
  "avancado_1",
  "avancado_2",
  "avancado_3",
] as const;

type Level = (typeof LEVELS)[number];

const defaultProgress: UserProgress = {
  rating: 600,
  solvedPuzzles: new Set<string>(),
  currentStreak: 0,
  bestStreak: 0,
  totalSolved: 0,
  currentLevel: "iniciante_1",
  currentPuzzleIndex: 0,
};

class PuzzleService {
  private userProgress: UserProgress;
  private puzzleData: Record<Level, PuzzleLevel>;

  constructor(initialProgress: UserProgress = defaultProgress) {
    this.userProgress = initialProgress;
    this.puzzleData = puzzlesData as Record<Level, PuzzleLevel>;
  }

  private findAppropriateLevel(rating: number): Level {
    for (const level of LEVELS) {
      const levelInfo = this.puzzleData[level].info;
      if (rating >= levelInfo.rating_min && rating < levelInfo.rating_max) {
        return level;
      }
    }
    return rating <= 400 ? "iniciante_1" : "avancado_3";
  }

  public getNextPuzzle(): Puzzle | null {
    // Atualiza o nível se necessário
    const appropriateLevel = this.findAppropriateLevel(
      this.userProgress.rating
    );
    if (appropriateLevel !== this.userProgress.currentLevel) {
      this.userProgress.currentLevel = appropriateLevel;
      this.userProgress.currentPuzzleIndex = 0;
    }

    const currentLevelData = this.puzzleData[this.userProgress.currentLevel];
    const puzzles = currentLevelData.puzzles;

    // Encontra o próximo puzzle não resolvido e válido
    while (this.userProgress.currentPuzzleIndex < puzzles.length) {
      const puzzle = puzzles[this.userProgress.currentPuzzleIndex];

      if (!this.userProgress.solvedPuzzles.has(puzzle.PuzzleId)) {
        // Verifica se a posição inicial é legal
        const game = new ChessGame();
        game.loadPosition(puzzle.FEN);

        if (game.isPositionLegal()) {
          return puzzle;
        }
      }

      this.userProgress.currentPuzzleIndex++;
    }

    // Se chegou ao fim dos puzzles deste nível
    if (this.userProgress.currentPuzzleIndex >= puzzles.length) {
      // Tenta avançar para o próximo nível
      const currentLevelIndex = LEVELS.indexOf(this.userProgress.currentLevel);
      if (currentLevelIndex < LEVELS.length - 1) {
        this.userProgress.currentLevel = LEVELS[currentLevelIndex + 1];
        this.userProgress.currentPuzzleIndex = 0;
        return this.getNextPuzzle();
      }
      return null;
    }

    return null;
  }

  public submitPuzzleSolution(puzzleId: string, moves: string[]): boolean {
    const currentLevelData = this.puzzleData[this.userProgress.currentLevel];
    const puzzle =
      currentLevelData.puzzles[this.userProgress.currentPuzzleIndex];

    if (!puzzle || puzzle.PuzzleId !== puzzleId) return false;

    const isCorrect = this.areMovesSame(moves, puzzle.Moves.split(" "));

    if (isCorrect) {
      this.userProgress.solvedPuzzles.add(puzzleId);
      this.userProgress.currentStreak++;
      this.userProgress.totalSolved++;
      this.userProgress.bestStreak = Math.max(
        this.userProgress.bestStreak,
        this.userProgress.currentStreak
      );

      const ratingDiff = puzzle.Rating - this.userProgress.rating;
      this.userProgress.rating += Math.floor(ratingDiff * 0.1) + 10;
    } else {
      this.userProgress.currentStreak = 0;
      this.userProgress.rating = Math.max(400, this.userProgress.rating - 5);
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

  public getCurrentLevelInfo(): LevelInfo {
    return this.puzzleData[this.userProgress.currentLevel].info;
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

"use client";

import { useState, useEffect } from "react";
import puzzlesData from "@/data/puzzles.json";
import ChessGame from "./chess";
import { Square } from "chess.js";

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
        // Verifica se a posição inicial e os movimentos são válidos
        const game = new ChessGame();
        try {
          game.loadPosition(puzzle.FEN);

          if (!game.isPositionLegal()) {
            console.error(
              "Posição inicial inválida para o puzzle:",
              puzzle.PuzzleId
            );
            this.userProgress.currentPuzzleIndex++;
            continue;
          }

          // Tenta executar a sequência de movimentos esperada
          const moves = puzzle.Moves.split(" ");
          let isSequenceValid = true;

          for (const move of moves) {
            const [from, to] = [move.slice(0, 2), move.slice(2, 4)];
            if (!game.isValidMove(from as Square, to as Square)) {
              console.error(
                "Sequência de movimentos inválida no puzzle:",
                puzzle.PuzzleId
              );
              isSequenceValid = false;
              break;
            }
            game.move({ from: from as Square, to: to as Square });
          }

          if (isSequenceValid) {
            return puzzle;
          }
        } catch (error) {
          console.error("Erro ao validar puzzle:", puzzle.PuzzleId, error);
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

    if (!puzzle || puzzle.PuzzleId !== puzzleId) {
      console.error("Puzzle inválido:", {
        expected: puzzle?.PuzzleId,
        received: puzzleId,
      });
      return false;
    }

    // Remove o prefixo 'c:' dos movimentos do computador
    const cleanMoves = moves.map((move) =>
      move.startsWith("c:") ? move.slice(2) : move
    );
    const lastUserMove = cleanMoves[cleanMoves.length - 1];

    const expectedMoves = puzzle.Moves.split(" ");
    const userExpectedMoves = puzzle.FEN.includes(" w ")
      ? expectedMoves.filter((_, idx) => idx % 2 === 0) // Se for a vez das brancas, movimentos nas posições pares
      : expectedMoves.filter((_, idx) => idx % 2 === 1); // Se for a vez das pretas, movimentos nas posições ímpares

    // Se não houver movimentos submetidos, retorna falso
    if (cleanMoves.length === 0) {
      return false;
    }

    const expectedMove = userExpectedMoves[cleanMoves.length - 1];

    // Verifica se temos movimentos válidos para comparar
    if (!lastUserMove || !expectedMove) {
      return false;
    }

    console.log("Validando movimento:", {
      puzzleId,
      lastUserMove,
      expectedMove,
      cleanMoves,
      userExpectedMoves,
      isWhiteTurn: puzzle.FEN.includes(" w "),
    });

    // Verifica se o movimento atual está correto
    const isCurrentMoveCorrect =
      lastUserMove.toLowerCase() === expectedMove.toLowerCase();

    // Se o movimento está correto e completou a sequência, marca como resolvido
    if (
      isCurrentMoveCorrect &&
      cleanMoves.length === userExpectedMoves.length
    ) {
      this.userProgress.solvedPuzzles.add(puzzleId);
      this.userProgress.currentStreak++;
      this.userProgress.totalSolved++;
      this.userProgress.bestStreak = Math.max(
        this.userProgress.bestStreak,
        this.userProgress.currentStreak
      );

      const ratingDiff = puzzle.Rating - this.userProgress.rating;
      this.userProgress.rating += Math.floor(ratingDiff * 0.1) + 10;
    } else if (!isCurrentMoveCorrect) {
      this.userProgress.currentStreak = 0;
      this.userProgress.rating = Math.max(400, this.userProgress.rating - 5);
    }

    return isCurrentMoveCorrect;
  }

  private areMovesSame(moves1: string[], moves2: string[]): boolean {
    if (!moves1 || !moves2 || moves1.length > moves2.length) return false;

    const puzzle =
      this.puzzleData[this.userProgress.currentLevel].puzzles[
        this.userProgress.currentPuzzleIndex
      ];

    console.log("Iniciando validação de movimentos:", {
      userMoves: moves1,
      expectedMoves: moves2,
      puzzleId: puzzle.PuzzleId,
      initialFen: puzzle.FEN,
    });

    // Cria um novo jogo para validar os movimentos
    const game = new ChessGame();
    game.loadPosition(puzzle.FEN);

    // Aplica os movimentos um a um e compara
    for (let i = 0; i < moves1.length; i++) {
      const userMove = moves1[i].toLowerCase();
      const expectedMove = moves2[i].toLowerCase();

      console.log(`Validando movimento ${i + 1}:`, {
        userMove,
        expectedMove,
        currentFen: game.fen(),
        moveNumber: i + 1,
      });

      // Verifica se os movimentos são idênticos
      if (userMove !== expectedMove) {
        console.log(`Movimento incorreto na posição ${i + 1}:`, {
          userMove,
          expectedMove,
          fen: game.fen(),
        });
        return false;
      }

      // Tenta aplicar o movimento esperado
      try {
        const from = expectedMove.slice(0, 2) as Square;
        const to = expectedMove.slice(2, 4) as Square;
        const result = game.move({ from, to, promotion: "q" });

        if (!result) {
          console.error(`Erro ao aplicar movimento ${i + 1}:`, {
            move: expectedMove,
            fen: game.fen(),
          });
          return false;
        }

        console.log(`Movimento ${i + 1} validado:`, {
          move: expectedMove,
          newFen: game.fen(),
          isCorrect: true,
        });
      } catch (error) {
        console.error(`Erro ao processar movimento ${i + 1}:`, {
          move: expectedMove,
          error,
          fen: game.fen(),
        });
        return false;
      }
    }

    // Se chegou até aqui, os movimentos feitos até agora estão corretos
    console.log("Resultado final da validação:", {
      isPartiallyComplete: true,
      userMoves: moves1,
      expectedMoves: moves2,
      finalFen: game.fen(),
    });

    // Retorna true se os movimentos até agora estão corretos
    return true;
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

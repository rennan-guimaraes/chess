"use client";

import { useState, useCallback, useEffect } from "react";
import ChessGame from "@/lib/chess";
import { Square } from "chess.js";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { MoveHistory } from "@/components/chess/MoveHistory";
import {
  usePuzzleService,
  type Puzzle,
  type UserProgress,
} from "@/lib/puzzles";

function PuzzleProgress({
  rating,
  streak,
  bestStreak,
  totalSolved,
  currentLevel,
  levelInfo,
}: {
  rating: number;
  streak: number;
  bestStreak: number;
  totalSolved: number;
  currentLevel: string;
  levelInfo: {
    rating_min: number;
    rating_max: number;
    total_puzzles: number;
  };
}) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">Seu Progresso</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Nível:</span>
            <span className="font-bold">
              {currentLevel.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rating:</span>
            <span className="font-bold">{rating}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Faixa do Nível:</span>
            <span className="font-bold">
              {levelInfo.rating_min} - {levelInfo.rating_max}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sequência Atual:</span>
            <span className="font-bold">{streak}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Melhor Sequência:</span>
            <span className="font-bold">{bestStreak}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Resolvido:</span>
            <span className="font-bold">{totalSolved}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PuzzleInfo({ puzzle }: { puzzle: Puzzle }) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">Puzzle</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tema:</span>
            <span className="font-medium">{puzzle.theme}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rating:</span>
            <span className="font-medium">{puzzle.Rating}</span>
          </div>
          <p className="text-sm mt-2">{puzzle.Description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const defaultProgress: UserProgress = {
  rating: 600,
  solvedPuzzles: new Set<string>(),
  currentStreak: 0,
  bestStreak: 0,
  totalSolved: 0,
  currentLevel: "iniciante_1",
  currentPuzzleIndex: 0,
};

export default function PuzzlesPage() {
  const [game] = useState(() => new ChessGame());
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [userMoves, setUserMoves] = useState<string[]>([]);
  const [fen, setFen] = useState(game.fen());
  const [gameState, setGameState] = useState(game.getGameState());
  const [userProgress, setUserProgress] =
    useState<UserProgress>(defaultProgress);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [levelInfo, setLevelInfo] = useState({
    rating_min: 0,
    rating_max: 0,
    total_puzzles: 0,
  });
  const [, setLastMoveCorrect] = useState<boolean | null>(null);

  const puzzleService = usePuzzleService();

  useEffect(() => {
    if (puzzleService) {
      setUserProgress(puzzleService.getUserProgress());
      setLevelInfo(puzzleService.getCurrentLevelInfo());
      loadNextPuzzle();
    }
  }, [puzzleService]);

  const loadNextPuzzle = useCallback(async () => {
    if (!puzzleService) return;

    setIsLoading(true);
    setLastMoveCorrect(null);
    try {
      const puzzle = puzzleService.getNextPuzzle();
      if (puzzle) {
        game.reset();
        game.loadPosition(puzzle.FEN);
        setCurrentPuzzle(puzzle);
        setUserMoves([]);
        setFen(game.fen());
        setGameState(game.getGameState());
        setMessage(null);
        setLevelInfo(puzzleService.getCurrentLevelInfo());
      } else {
        setMessage({
          text: "Parabéns! Você completou todos os puzzles disponíveis!",
          type: "success",
        });
      }
    } catch (error) {
      console.error(error);
      setMessage({
        text: "Erro ao carregar o próximo puzzle. Tente novamente.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [game, puzzleService]);

  const handlePieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!currentPuzzle || !puzzleService || isLoading) return false;

      const moveResult = game.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: "q",
      });

      if (moveResult) {
        const newMoves = [...userMoves, `${sourceSquare}${targetSquare}`];
        setUserMoves(newMoves);
        setFen(game.fen());
        setGameState(game.getGameState());

        const isCorrect = puzzleService.submitPuzzleSolution(
          currentPuzzle.PuzzleId,
          newMoves
        );

        setLastMoveCorrect(isCorrect);

        if (isCorrect) {
          setTimeout(() => {
            setMessage({
              text: "Correto! Carregando próximo puzzle...",
              type: "success",
            });
            setUserProgress(puzzleService.getUserProgress());
            setTimeout(() => {
              loadNextPuzzle();
            }, 1500);
          }, 500);
        } else {
          setTimeout(() => {
            setMessage({
              text: "Incorreto. Tente novamente!",
              type: "error",
            });
            setTimeout(() => {
              game.loadPosition(currentPuzzle.FEN);
              setUserMoves([]);
              setFen(game.fen());
              setGameState(game.getGameState());
              setMessage(null);
              setLastMoveCorrect(null);
            }, 1500);
          }, 500);
        }

        return true;
      }
      return false;
    },
    [game, currentPuzzle, userMoves, loadNextPuzzle, puzzleService, isLoading]
  );

  if (!puzzleService) {
    return <div>Carregando serviço de puzzles...</div>;
  }

  return (
    <main className="h-full">
      <div className="flex flex-col h-full p-4 w-full">
        <h1 className="text-3xl font-bold text-center mb-4">
          Puzzles de Xadrez
        </h1>

        {message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              message.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg">Carregando puzzle...</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 min-h-0 overflow-hidden">
            <div className="flex flex-col gap-4 col-span-2">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 w-full">
                  <ChessBoard
                    fen={fen}
                    onPieceDrop={handlePieceDrop}
                    orientation={
                      currentPuzzle && currentPuzzle.FEN.split(" ")[1] === "w"
                        ? "white"
                        : "black"
                    }
                  />
                </div>
                <div className="flex flex-col gap-4 col-span-1 h-full">
                  <PuzzleProgress
                    rating={userProgress.rating}
                    streak={userProgress.currentStreak}
                    bestStreak={userProgress.bestStreak}
                    totalSolved={userProgress.totalSolved}
                    currentLevel={userProgress.currentLevel}
                    levelInfo={levelInfo}
                  />
                  {currentPuzzle && <PuzzleInfo puzzle={currentPuzzle} />}
                </div>
              </div>
            </div>

            <MoveHistory
              moves={gameState.moveHistory}
              currentMoveIndex={gameState.currentMoveIndex}
              onMoveSelect={() => {}}
            />
          </div>
        )}
      </div>
    </main>
  );
}

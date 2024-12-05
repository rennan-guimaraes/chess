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
}: {
  rating: number;
  streak: number;
  bestStreak: number;
  totalSolved: number;
}) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">Seu Progresso</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rating:</span>
            <span className="font-bold">{rating}</span>
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
            <span className="font-medium">{puzzle.rating}</span>
          </div>
          <p className="text-sm mt-2">{puzzle.description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

const defaultProgress: UserProgress = {
  rating: 800,
  solvedPuzzles: new Set<string>(),
  currentStreak: 0,
  bestStreak: 0,
  totalSolved: 0,
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

  const puzzleService = usePuzzleService();

  useEffect(() => {
    if (puzzleService) {
      setUserProgress(puzzleService.getUserProgress());
      loadNextPuzzle();
    }
  }, [puzzleService]);

  const loadNextPuzzle = useCallback(() => {
    if (!puzzleService) return;

    const puzzle = puzzleService.getNextPuzzle();
    if (puzzle) {
      game.reset();
      game.loadPosition(puzzle.fen);
      setCurrentPuzzle(puzzle);
      setUserMoves([]);
      setFen(game.fen());
      setGameState(game.getGameState());
      setMessage(null);
    } else {
      setMessage({
        text: "Parabéns! Você completou todos os puzzles disponíveis!",
        type: "success",
      });
    }
  }, [game, puzzleService]);

  const handlePieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!currentPuzzle || !puzzleService) return false;

      const moveSuccess = game.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: "q",
      });

      if (moveSuccess) {
        const newMoves = [...userMoves, `${sourceSquare}${targetSquare}`];
        setUserMoves(newMoves);
        setFen(game.fen());
        setGameState(game.getGameState());

        if (newMoves.length === currentPuzzle.moves.length) {
          const isCorrect = puzzleService.submitPuzzleSolution(
            currentPuzzle.id,
            newMoves
          );

          if (isCorrect) {
            setMessage({
              text: "Correto! Carregando próximo puzzle...",
              type: "success",
            });
            setUserProgress(puzzleService.getUserProgress());
            setTimeout(loadNextPuzzle, 2000);
          } else {
            setMessage({
              text: "Incorreto. Tente novamente!",
              type: "error",
            });
            setTimeout(() => {
              game.loadPosition(currentPuzzle.fen);
              setUserMoves([]);
              setFen(game.fen());
              setGameState(game.getGameState());
              setMessage(null);
            }, 2000);
          }
        }

        return true;
      }
      return false;
    },
    [game, currentPuzzle, userMoves, loadNextPuzzle, puzzleService]
  );

  if (!puzzleService) {
    return <div>Carregando...</div>;
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

        <div className="grid grid-cols-3 gap-4 min-h-0 overflow-hidden">
          <div className="flex flex-col gap-4 col-span-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 w-full">
                <ChessBoard fen={fen} onPieceDrop={handlePieceDrop} />
              </div>
              <div className="flex flex-col gap-4 col-span-1 h-full">
                <PuzzleProgress
                  rating={userProgress.rating}
                  streak={userProgress.currentStreak}
                  bestStreak={userProgress.bestStreak}
                  totalSolved={userProgress.totalSolved}
                />
                {currentPuzzle && <PuzzleInfo puzzle={currentPuzzle} />}
              </div>
            </div>
          </div>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Histórico de Movimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <MoveHistory
                moves={gameState.moveHistory}
                currentMoveIndex={gameState.currentMoveIndex}
                onMoveSelect={() => {}}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

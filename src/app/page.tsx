"use client";

import { useState, useCallback, useEffect } from "react";
import ChessGame from "@/lib/chess";
import { Square } from "chess.js";
import { stockfish } from "@/lib/stockfish";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChessBoard } from "@/components/chess/ChessBoard";
import { GameInfo } from "@/components/chess/GameInfo";
import { CapturedPieces } from "@/components/chess/CapturedPieces";
import { MoveHistory } from "@/components/chess/MoveHistory";
import { GameControls } from "@/components/chess/GameControls";

export default function Home() {
  const [game] = useState(() => new ChessGame());
  const [fen, setFen] = useState(game.fen());
  const [gameState, setGameState] = useState(game.getGameState());
  const [difficulty, setDifficulty] = useState(5);
  const [isComputerEnabled, setIsComputerEnabled] = useState(false);
  const [isComputerTurn, setIsComputerTurn] = useState(false);

  useEffect(() => {
    stockfish.initialize();
    return () => stockfish.destroy();
  }, []);

  useEffect(() => {
    if (
      isComputerEnabled &&
      isComputerTurn &&
      !gameState.isCheckmate &&
      !gameState.isDraw
    ) {
      handleComputerMove();
    }
  }, [
    isComputerEnabled,
    isComputerTurn,
    gameState.isCheckmate,
    gameState.isDraw,
  ]);

  const handlePieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      // Se for a vez do computador, não permitir movimento
      if (isComputerTurn) return false;

      const moveSuccess = game.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: "q",
      });

      if (moveSuccess) {
        setFen(game.fen());
        setGameState(game.getGameState());

        // Se o jogo contra computador estiver ativado, definir como vez do computador
        if (isComputerEnabled) {
          setIsComputerTurn(true);
        }

        return true;
      }
      return false;
    },
    [game, isComputerEnabled, isComputerTurn]
  );

  const resetGame = useCallback(() => {
    game.reset();
    setFen(game.fen());
    setGameState(game.getGameState());
    setIsComputerTurn(false);
  }, [game]);

  const handleComputerMove = useCallback(() => {
    stockfish.getBestMove(game.fen(), difficulty, (bestMove) => {
      const from = bestMove.slice(0, 2) as Square;
      const to = bestMove.slice(2, 4) as Square;

      const moveSuccess = game.move({
        from,
        to,
        promotion: "q",
      });

      if (moveSuccess) {
        setFen(game.fen());
        setGameState(game.getGameState());
        setIsComputerTurn(false);
      }
    });
  }, [game, difficulty]);

  const toggleComputer = useCallback(() => {
    setIsComputerEnabled((prev) => !prev);
    setIsComputerTurn(false);
  }, []);

  return (
    <main className="h-full">
      <div className="flex flex-col h-full p-4 w-full">
        <h1 className="text-3xl font-bold text-center mb-4">
          Xadrez e Puzzles
        </h1>

        <div className="grid grid-cols-3 gap-4 min-h-0 overflow-hidden">
          <div className="flex flex-col gap-4 col-span-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 w-full">
                <ChessBoard fen={fen} onPieceDrop={handlePieceDrop} />
              </div>
              <div className="flex flex-col gap-4 col-span-1 h-full">
                <GameControls
                  difficulty={difficulty}
                  onDifficultyChange={setDifficulty}
                  onComputerMove={handleComputerMove}
                  onReset={resetGame}
                  isComputerEnabled={isComputerEnabled}
                  onToggleComputer={toggleComputer}
                />
                <MoveHistory moves={gameState.moveHistory} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <GameInfo
                turn={game.turn()}
                isCheck={gameState.isCheck}
                isCheckmate={gameState.isCheckmate}
                isDraw={gameState.isDraw}
              />
              <CapturedPieces
                whitePieces={gameState.capturedPieces.white}
                blackPieces={gameState.capturedPieces.black}
              />
            </div>
          </div>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Chat (Em breve)</CardTitle>
            </CardHeader>
            <CardContent className="h-full bg-muted/10">
              {/* Área reservada para o futuro chat */}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

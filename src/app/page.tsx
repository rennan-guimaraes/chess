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

  useEffect(() => {
    stockfish.initialize();
    return () => stockfish.destroy();
  }, []);

  const handlePieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      const moveSuccess = game.move({
        from: sourceSquare as Square,
        to: targetSquare as Square,
        promotion: "q",
      });

      if (moveSuccess) {
        setFen(game.fen());
        setGameState(game.getGameState());
        return true;
      }
      return false;
    },
    [game]
  );

  const resetGame = useCallback(() => {
    game.reset();
    setFen(game.fen());
    setGameState(game.getGameState());
  }, [game]);

  const handleComputerMove = useCallback(() => {
    stockfish.getBestMove(game.fen(), 15, (bestMove) => {
      const from = bestMove.slice(0, 2) as Square;
      const to = bestMove.slice(2, 4) as Square;

      handlePieceDrop(from, to);
    });
  }, [game, handlePieceDrop]);

  return (
    <main className="h-full">
      <div className="container flex flex-col h-full p-4 max-w-[1400px]">
        <h1 className="text-3xl font-bold text-center mb-4">
          Xadrez e Puzzles
        </h1>

        <div className="flex flex-1 gap-4 min-h-0 overflow-hidden">
          <div className="flex flex-col w-[800px] gap-4">
            <ChessBoard fen={fen} onPieceDrop={handlePieceDrop} />

            <div className="grid grid-cols-3 gap-4">
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

              <MoveHistory moves={gameState.moveHistory} />
            </div>

            <GameControls
              onComputerMove={handleComputerMove}
              onResetGame={resetGame}
            />
          </div>

          <Card className="flex-1">
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

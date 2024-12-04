"use client";

import { useState, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import ChessGame from "@/lib/chess";
import { Button } from "@/components/ui/button";
import { Square } from "chess.js";

export default function Home() {
  const [game] = useState(() => new ChessGame());
  const [fen, setFen] = useState(game.fen());
  const [gameState, setGameState] = useState(game.getGameState());

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-4xl font-bold mb-8">Xadrez e Puzzles</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
        <div className="flex flex-col">
          <Chessboard
            position={fen}
            onPieceDrop={handlePieceDrop}
            boardWidth={480}
            customBoardStyle={{
              borderRadius: "4px",
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
            }}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Estado do Jogo</h2>
            <div className="space-y-2">
              <p>Turno: {game.turn() === "w" ? "Brancas" : "Pretas"}</p>
              {gameState.isCheck && <p className="text-red-500">Xeque!</p>}
              {gameState.isCheckmate && (
                <p className="text-red-600 font-bold">Xeque-mate!</p>
              )}
              {gameState.isDraw && <p className="text-blue-600">Empate!</p>}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Peças Capturadas</h2>
            <div className="flex gap-4">
              <div>
                <h3 className="font-semibold">Brancas</h3>
                <p>{gameState.capturedPieces.white.join(" ")}</p>
              </div>
              <div>
                <h3 className="font-semibold">Pretas</h3>
                <p>{gameState.capturedPieces.black.join(" ")}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-2">Histórico de Movimentos</h2>
            <div className="max-h-40 overflow-y-auto">
              {gameState.moveHistory.map((move, index) => (
                <span key={index} className="mr-2">
                  {index + 1}. {move}
                </span>
              ))}
            </div>
          </div>

          <Button onClick={resetGame} className="w-full" variant="destructive">
            Reiniciar Jogo
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useCallback } from "react";
import { Square } from "chess.js";
import { ChessBoard } from "./ChessBoard";
import { usePuzzle } from "@/contexts/PuzzleContext";

const PuzzleBoard = () => {
  const {
    fen,
    currentPuzzle,
    lastMove,
    isLastMoveCorrect,
    makeMove,
    isLoading,
    isComputerMoving,
  } = usePuzzle();

  const handlePieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string) => {
      if (!currentPuzzle || isLoading || isComputerMoving) return false;

      // Verifica se é a vez do jogador
      const playerColor = currentPuzzle.FEN.includes(" w ") ? "white" : "black";
      const currentTurn = fen.includes(" w ") ? "white" : "black";

      if (playerColor !== currentTurn) {
        return false;
      }

      return makeMove(sourceSquare as Square, targetSquare as Square);
    },
    [currentPuzzle, fen, isLoading, isComputerMoving, makeMove]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Carregando puzzle...</p>
      </div>
    );
  }

  return (
    <ChessBoard
      fen={fen}
      onPieceDrop={handlePieceDrop}
      orientation={
        currentPuzzle && currentPuzzle.FEN.includes(" w ") ? "white" : "black"
      }
      lastMove={lastMove}
      isCorrectMove={isLastMoveCorrect}
      isInteractive={!isComputerMoving}
    />
  );
};

export { PuzzleBoard };

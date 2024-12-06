import { Chessboard } from "react-chessboard";
import { Card } from "../ui/card";

interface ChessBoardProps {
  fen: string;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  orientation?: "white" | "black";
  lastMove?: { from: string; to: string } | null;
  isCorrectMove?: boolean | null;
  isInteractive?: boolean;
}

export function ChessBoard({
  fen,
  onPieceDrop,
  orientation = "white",
  lastMove,
  isCorrectMove,
  isInteractive = true,
}: ChessBoardProps) {
  // Define cores para destacar movimentos
  const moveHighlightColor =
    isCorrectMove === true
      ? "rgba(0, 255, 0, 0.3)"
      : isCorrectMove === false
      ? "rgba(255, 0, 0, 0.3)"
      : "rgba(255, 255, 0, 0.3)";

  return (
    <Card className="p-4 flex justify-center items-center w-full">
      <div className="max-w-[660px] w-full">
        <Chessboard
          position={fen}
          onPieceDrop={isInteractive ? onPieceDrop : undefined}
          boardWidth={660}
          boardOrientation={orientation}
          customBoardStyle={{
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          }}
          customSquareStyles={{
            ...(lastMove
              ? {
                  [lastMove.from]: { backgroundColor: moveHighlightColor },
                  [lastMove.to]: { backgroundColor: moveHighlightColor },
                }
              : {}),
          }}
          arePiecesDraggable={isInteractive}
        />
      </div>
    </Card>
  );
}

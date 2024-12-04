import { Chessboard } from "react-chessboard";
import { Card } from "../ui/card";

interface ChessBoardProps {
  fen: string;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
}

export function ChessBoard({ fen, onPieceDrop }: ChessBoardProps) {
  return (
    <Card className="p-4 m-auto">
      <Chessboard
        position={fen}
        onPieceDrop={onPieceDrop}
        boardWidth={660}
        customBoardStyle={{
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
        }}
      />
    </Card>
  );
}

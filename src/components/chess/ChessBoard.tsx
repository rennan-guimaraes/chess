import { Chessboard } from "react-chessboard";
import { Card } from "../ui/card";

interface ChessBoardProps {
  fen: string;
  onPieceDrop: (sourceSquare: string, targetSquare: string) => boolean;
  orientation?: "white" | "black";
}

export function ChessBoard({
  fen,
  onPieceDrop,
  orientation = "white",
}: ChessBoardProps) {
  return (
    <Card className="p-4 flex justify-center items-center w-full">
      <div className="max-w-[660px] w-full">
        <Chessboard
          position={fen}
          onPieceDrop={onPieceDrop}
          boardWidth={660}
          boardOrientation={orientation}
          customBoardStyle={{
            borderRadius: "8px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          }}
        />
      </div>
    </Card>
  );
}

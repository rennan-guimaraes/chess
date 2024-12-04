import React from "react";
import Image from "next/image";

interface ChessBoardProps {
  fen: string;
  onSquareClick: (square: string) => void;
  selectedSquare: string | null;
}

const ChessBoard: React.FC<ChessBoardProps> = ({
  fen,
  onSquareClick,
  selectedSquare,
}) => {
  const ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];
  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];

  const getPieceImage = (piece: string) => {
    const color = piece.toLowerCase() === piece ? "b" : "w";
    const pieceName = piece.toLowerCase();
    let pieceType = "";

    switch (pieceName) {
      case "p":
        pieceType = "pawn";
        break;
      case "r":
        pieceType = "rook";
        break;
      case "n":
        pieceType = "knight";
        break;
      case "b":
        pieceType = "bishop";
        break;
      case "q":
        pieceType = "queen";
        break;
      case "k":
        pieceType = "king";
        break;
    }

    return `/pieces/${color}-${pieceType}.png`;
  };

  const fenPieces = fen.split(" ")[0].split("/");
  const currentPosition = fenPieces.map((rank) => {
    const row = [];
    for (let char of rank) {
      if (isNaN(parseInt(char))) {
        row.push(char);
      } else {
        for (let i = 0; i < parseInt(char); i++) {
          row.push("");
        }
      }
    }
    return row;
  });

  return (
    <div className="inline-grid grid-cols-8 border border-gray-800">
      {ranks.map((rank, rankIndex) =>
        files.map((file, fileIndex) => {
          const square = `${file}${rank}`;
          const piece = currentPosition[rankIndex][fileIndex];
          const isLight = (rankIndex + fileIndex) % 2 === 0;

          return (
            <div
              key={square}
              className={`w-16 h-16 flex items-center justify-center cursor-pointer ${
                isLight ? "bg-amber-100" : "bg-amber-800"
              } ${selectedSquare === square ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => onSquareClick(square)}
            >
              {piece && (
                <div className="relative w-12 h-12">
                  <Image
                    src={getPieceImage(piece)}
                    alt={`${piece} on ${square}`}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ChessBoard;

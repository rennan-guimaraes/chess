"use client";

import { useState } from "react";
import ChessBoard from "@/components/ChessBoard";
import ChessGame from "@/lib/chess";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const puzzleFen = "3r1rk1/1pp2ppp/1p2pn2/8/3P4/2P1P3/PP3PPP/2KR3R w - - 0 1";
const puzzleSolution = ["d4d5", "f6d5", "d1d5"];

export default function Home() {
  const [game] = useState(() => new ChessGame());
  const [fen, setFen] = useState(game.fen());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleSquareClick = (square: string) => {
    const piece = game.getPiece(square);
    const isCurrentPlayerPiece =
      (game.turn() === "w" && piece && piece.startsWith("w")) ||
      (game.turn() === "b" && piece && piece.startsWith("b"));

    if (selectedSquare) {
      if (square === selectedSquare) {
        // Desseleciona a peça se clicar nela novamente
        setSelectedSquare(null);
        setMessage("");
      } else if (isCurrentPlayerPiece) {
        // Troca para a nova peça selecionada
        setSelectedSquare(square);
        setMessage("");
      } else {
        // Tenta fazer o movimento
        if (game.isValidMove(selectedSquare, square)) {
          const moveSuccessful = game.move(selectedSquare, square);
          if (moveSuccessful) {
            setFen(game.fen());
            setSelectedSquare(null);
            setMessage("");

            if (game.isGameOver()) {
              setMessage("Fim de jogo!");
            }
          } else {
            setMessage("Erro ao mover a peça. Tente novamente.");
          }
        } else {
          setMessage("Movimento inválido. Tente novamente.");
        }
      }
    } else if (isCurrentPlayerPiece) {
      setSelectedSquare(square);
      setMessage("");
    } else {
      setMessage("Selecione uma peça sua para mover.");
    }
  };

  const resetGame = () => {
    game.reset();
    setFen(game.fen());
    setSelectedSquare(null);
    setMessage("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-4xl font-bold mb-8">Xadrez e Puzzles</h1>
      <Tabs defaultValue="game" className="w-full max-w-[640px]">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="game" className="text-lg">
            Jogo
          </TabsTrigger>
          <TabsTrigger value="puzzle" className="text-lg">
            Puzzle
          </TabsTrigger>
        </TabsList>
        <TabsContent value="game" className="flex flex-col items-center">
          <ChessBoard
            fen={fen}
            onSquareClick={handleSquareClick}
            selectedSquare={selectedSquare}
          />
          <div className="mt-4 h-6 text-center text-red-500">{message}</div>
          <div className="mt-6 flex flex-col items-center gap-4">
            <p className="text-lg font-medium">
              Turno: {game.turn() === "w" ? "Brancas" : "Pretas"}
            </p>
            <Button
              onClick={resetGame}
              className="bg-black text-white hover:bg-gray-800"
            >
              Reiniciar Jogo
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

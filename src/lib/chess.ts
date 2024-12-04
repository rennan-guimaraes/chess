import { Chess, Square, PieceSymbol } from "chess.js";

interface ChessMove {
  from: Square;
  to: Square;
  promotion?: "q" | "r" | "b" | "n";
}

interface GameState {
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isStalemate: boolean;
  isThreefoldRepetition: boolean;
  isInsufficientMaterial: boolean;
  moveHistory: string[];
  capturedPieces: {
    white: string[];
    black: string[];
  };
}

class ChessGame {
  private game: Chess;
  private moveHistory: string[] = [];
  private capturedPieces: {
    white: string[];
    black: string[];
  } = { white: [], black: [] };

  constructor(fen?: string) {
    this.game = new Chess(fen);
  }

  public move(moveDetails: ChessMove): boolean {
    try {
      const move = this.game.move(moveDetails);
      if (move) {
        this.moveHistory.push(move.san);
        if (move.captured) {
          const color = move.color === "w" ? "white" : "black";
          this.capturedPieces[color].push(move.captured);
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public getGameState(): GameState {
    return {
      isCheck: this.game.isCheck(),
      isCheckmate: this.game.isCheckmate(),
      isDraw: this.game.isDraw(),
      isStalemate: this.game.isStalemate(),
      isThreefoldRepetition: this.game.isThreefoldRepetition(),
      isInsufficientMaterial: this.game.isInsufficientMaterial(),
      moveHistory: [...this.moveHistory],
      capturedPieces: {
        white: [...this.capturedPieces.white],
        black: [...this.capturedPieces.black],
      },
    };
  }

  public getPossibleMoves(square: Square): Square[] {
    return this.game
      .moves({
        square,
        verbose: true,
      })
      .map((move) => move.to as Square);
  }

  public fen(): string {
    return this.game.fen();
  }

  public turn(): "w" | "b" {
    return this.game.turn();
  }

  public reset(): void {
    this.game.reset();
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
  }

  public isValidMove(from: Square, to: Square): boolean {
    const moves = this.game.moves({ verbose: true });
    return moves.some((move) => move.from === from && move.to === to);
  }

  public getPiece(square: Square): string | null {
    const piece = this.game.get(square);
    return piece ? piece.color + piece.type : null;
  }
}

export default ChessGame;

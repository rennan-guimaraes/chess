import { Chess, Square } from "chess.js";

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
  currentMoveIndex: number;
}

class ChessGame {
  private game: Chess;
  private moveHistory: string[] = [];
  private positionHistory: string[] = [];
  private currentMoveIndex: number = -1;
  private capturedPieces: {
    white: string[];
    black: string[];
  } = { white: [], black: [] };

  constructor(fen?: string) {
    this.game = new Chess(fen);
    this.positionHistory = [this.game.fen()];
  }

  public move(moveDetails: ChessMove): boolean {
    try {
      const move = this.game.move(moveDetails);
      if (move) {
        // Limpar histórico futuro se estivermos fazendo um novo movimento a partir de uma posição anterior
        if (this.currentMoveIndex < this.moveHistory.length - 1) {
          this.moveHistory = this.moveHistory.slice(
            0,
            this.currentMoveIndex + 1
          );
          this.positionHistory = this.positionHistory.slice(
            0,
            this.currentMoveIndex + 2
          );
        }

        this.moveHistory.push(move.san);
        this.positionHistory.push(this.game.fen());
        this.currentMoveIndex++;

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
      currentMoveIndex: this.currentMoveIndex,
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
    this.positionHistory = [this.game.fen()];
    this.currentMoveIndex = -1;
    this.capturedPieces = { white: [], black: [] };
  }

  public loadPosition(fen: string): void {
    this.game.load(fen);
    this.moveHistory = [];
    this.positionHistory = [this.game.fen()];
    this.currentMoveIndex = -1;
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

  public goToMove(moveIndex: number): boolean {
    if (moveIndex >= -1 && moveIndex < this.moveHistory.length) {
      this.game.load(this.positionHistory[moveIndex + 1]);
      this.currentMoveIndex = moveIndex;
      return true;
    }
    return false;
  }

  public goToNextMove(): boolean {
    return this.goToMove(this.currentMoveIndex + 1);
  }

  public goToPreviousMove(): boolean {
    return this.goToMove(this.currentMoveIndex - 1);
  }

  public getCurrentMoveIndex(): number {
    return this.currentMoveIndex;
  }

  public getTotalMoves(): number {
    return this.moveHistory.length;
  }

  public isPositionLegal(): boolean {
    return !this.game.isCheck();
  }
}

export default ChessGame;

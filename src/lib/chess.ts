import { Chess } from "chess.js";

class ChessGame {
  private game: Chess;

  constructor() {
    this.game = new Chess();
  }

  public move(from: string, to: string): boolean {
    try {
      const result = this.game.move({ from, to, promotion: "q" }); // 'q' para promoção automática a rainha
      return !!result;
    } catch {
      return false;
    }
  }

  public fen(): string {
    return this.game.fen();
  }

  public isGameOver(): boolean {
    return this.game.isGameOver();
  }

  public turn(): "w" | "b" {
    return this.game.turn();
  }

  public getPiece(square: string): string | null {
    const piece = this.game.get(square);
    return piece ? piece.color + piece.type : null;
  }

  public reset(): void {
    this.game.reset();
  }

  public isValidMove(from: string, to: string): boolean {
    const moves = this.game.moves({ verbose: true });
    return moves.some((move) => move.from === from && move.to === to);
  }
}

export default ChessGame;

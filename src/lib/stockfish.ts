declare global {
  interface Window {
    Stockfish: any;
  }
}

class StockfishService {
  private worker: Worker | null = null;
  private isReady = false;
  private onMessageCallback: ((bestMove: string) => void) | null = null;

  initialize() {
    if (typeof window !== "undefined") {
      this.worker = new Worker("/stockfish.js");
      this.worker.onmessage = (e) => this.handleMessage(e.data);
      this.worker.postMessage("uci");
      this.worker.postMessage("isready");
    }
  }

  private handleMessage(message: string) {
    if (message === "readyok") {
      this.isReady = true;
    } else if (message.startsWith("bestmove")) {
      const bestMove = message.split(" ")[1];
      if (this.onMessageCallback) {
        this.onMessageCallback(bestMove);
      }
    }
  }

  getBestMove(
    fen: string,
    depth: number = 15,
    callback: (bestMove: string) => void
  ) {
    if (!this.worker || !this.isReady) return;

    this.onMessageCallback = callback;
    this.worker.postMessage(`position fen ${fen}`);
    this.worker.postMessage(`go depth ${depth}`);
  }

  destroy() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}

export const stockfish = new StockfishService();

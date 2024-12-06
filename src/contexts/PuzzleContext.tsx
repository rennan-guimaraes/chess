"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { Square } from "chess.js";
import ChessGame from "@/lib/chess";
import { Puzzle, UserProgress, usePuzzleService } from "@/lib/puzzles";

const defaultProgress: UserProgress = {
  rating: 600,
  solvedPuzzles: new Set<string>(),
  currentStreak: 0,
  bestStreak: 0,
  totalSolved: 0,
  currentLevel: "iniciante_1",
  currentPuzzleIndex: 0,
};

interface PuzzleContextType {
  game: ChessGame;
  currentPuzzle: Puzzle | null;
  userProgress: UserProgress;
  fen: string;
  gameState: any;
  userMoves: string[];
  isLoading: boolean;
  lastMove: { from: string; to: string } | null;
  isLastMoveCorrect: boolean | null;
  makeMove: (from: Square, to: Square) => boolean;
  loadNextPuzzle: () => Promise<void>;
  isComputerMoving: boolean;
}

const PuzzleContext = createContext<PuzzleContextType | null>(null);

export function PuzzleProvider({ children }: { children: ReactNode }) {
  const puzzleService = usePuzzleService();
  const [game] = useState(() => new ChessGame());
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [userMoves, setUserMoves] = useState<string[]>([]);
  const [fen, setFen] = useState(game.fen());
  const [gameState, setGameState] = useState(game.getGameState());
  const [isLoading, setIsLoading] = useState(true);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(
    null
  );
  const [isLastMoveCorrect, setIsLastMoveCorrect] = useState<boolean | null>(
    null
  );
  const [userProgress, setUserProgress] =
    useState<UserProgress>(defaultProgress);
  const [isComputerMoving, setIsComputerMoving] = useState(false);
  const loadNextPuzzleRef = useRef<() => Promise<void>>();

  // Efeito para carregar o puzzle inicial quando o serviço estiver pronto
  useEffect(() => {
    if (puzzleService) {
      loadNextPuzzle();
    }
  }, [puzzleService]);

  const makeComputerMove = useCallback(
    async (from: Square, to: Square) => {
      setIsComputerMoving(true);
      const moveResult = game.move({
        from,
        to,
        promotion: "q",
      });

      if (moveResult && typeof moveResult === "object") {
        const newMoves = [...userMoves, `c:${from}${to}`];
        console.log("Movimento do computador realizado:", {
          from,
          to,
          newMoves,
          fen: game.fen(),
        });
        setFen(game.fen());
        setGameState(game.getGameState());
        setLastMove({ from, to });
        setUserMoves(newMoves);
      }

      setIsComputerMoving(false);
    },
    [game, userMoves]
  );

  // Efeito para fazer o movimento inicial do computador quando necessário
  useEffect(() => {
    if (
      currentPuzzle &&
      currentPuzzle.FEN.includes(" b ") &&
      !isComputerMoving &&
      userMoves.length === 0
    ) {
      const expectedMoves = currentPuzzle.Moves.split(" ");
      const computerMoves = expectedMoves.filter((_, idx) => idx % 2 === 0); // Quando começa com pretas, computador faz os movimentos pares
      const firstComputerMove = computerMoves[0];
      const [from, to] = [
        firstComputerMove.slice(0, 2),
        firstComputerMove.slice(2, 4),
      ];
      makeComputerMove(from as Square, to as Square);
    }
  }, [currentPuzzle, isComputerMoving, userMoves.length, makeComputerMove]);

  const validateMove = useCallback(
    (moves: string[]) => {
      if (!currentPuzzle || !puzzleService) return false;

      const expectedMoves = currentPuzzle.Moves.split(" ");
      const isWhiteTurn = currentPuzzle.FEN.includes(" w ");

      // Determinar quais movimentos são do usuário com base na vez inicial
      const userExpectedMoves = isWhiteTurn
        ? expectedMoves.filter((_, idx) => idx % 2 === 0) // Se for a vez das brancas, movimentos nas posições pares
        : expectedMoves.filter((_, idx) => idx % 2 === 1); // Se for a vez das pretas, movimentos nas posições ímpares

      const isPuzzleComplete = moves.length === userExpectedMoves.length;

      console.log("Validando movimento:", {
        puzzleId: currentPuzzle.PuzzleId,
        movimentoAtual: moves[moves.length - 1],
        movimentoEsperado: userExpectedMoves[moves.length - 1],
        todosMovimentosUsuario: moves,
        todosMovimentosEsperados: userExpectedMoves,
        posicaoAtual: game.fen(),
        isPuzzleComplete,
        movimentosRestantes: userExpectedMoves.slice(moves.length),
        isWhiteTurn,
      });

      const isCorrect = puzzleService.submitPuzzleSolution(
        currentPuzzle.PuzzleId,
        moves
      );

      console.log("Resultado da validação:", {
        isCorrect,
        isPuzzleComplete,
        proximoMovimento:
          !isPuzzleComplete && isCorrect
            ? userExpectedMoves[moves.length]
            : null,
      });

      setIsLastMoveCorrect(isCorrect);

      if (isCorrect && isPuzzleComplete) {
        setUserProgress(puzzleService.getUserProgress());
        setTimeout(() => {
          loadNextPuzzleRef.current?.();
        }, 1000);
      } else if (isCorrect && !isPuzzleComplete) {
        const computerMoves = isWhiteTurn
          ? expectedMoves.filter((_, idx) => idx % 2 === 1) // Se usuário é brancas, computador faz movimentos ímpares
          : expectedMoves.filter((_, idx) => idx % 2 === 0); // Se usuário é pretas, computador faz movimentos pares
        const nextMove = computerMoves[Math.floor(moves.length / 2)];
        const [from, to] = [nextMove.slice(0, 2), nextMove.slice(2, 4)];
        console.log("Preparando próximo movimento do computador:", {
          from,
          to,
          fen: game.fen(),
          isWhiteTurn,
        });
        setTimeout(() => {
          makeComputerMove(from as Square, to as Square);
        }, 500);
      } else {
        console.log("Movimento incorreto, reiniciando puzzle");
        setTimeout(() => {
          game.loadPosition(currentPuzzle.FEN);
          setUserMoves([]);
          setFen(game.fen());
          setGameState(game.getGameState());
          setLastMove(null);
          setIsLastMoveCorrect(null);

          // Se for a vez das pretas, refaz o movimento inicial do computador
          if (!isWhiteTurn) {
            const computerMoves = expectedMoves.filter(
              (_, idx) => idx % 2 === 0
            );
            const firstComputerMove = computerMoves[0];
            const [from, to] = [
              firstComputerMove.slice(0, 2),
              firstComputerMove.slice(2, 4),
            ];
            makeComputerMove(from as Square, to as Square);
          }
        }, 1000);
      }

      return isCorrect;
    },
    [currentPuzzle, puzzleService, game, makeComputerMove, userMoves]
  );

  const makeMove = useCallback(
    (from: Square, to: Square) => {
      const moveResult = game.move({
        from,
        to,
        promotion: "q",
      });

      if (moveResult && typeof moveResult === "object") {
        const newMoves = [...userMoves, `${from}${to}`];
        setFen(game.fen());
        setGameState(game.getGameState());
        setLastMove({ from, to });
        setUserMoves(newMoves);

        return validateMove(newMoves);
      }

      return false;
    },
    [game, userMoves, validateMove]
  );

  const loadNextPuzzle = useCallback(async () => {
    if (!puzzleService) return;

    try {
      setIsLoading(true);
      const puzzle = puzzleService.getNextPuzzle();

      if (puzzle) {
        console.log("Carregando novo puzzle:", {
          puzzleId: puzzle.PuzzleId,
          posicaoInicial: puzzle.FEN,
          movimentosEsperados: puzzle.Moves,
          vezInicial: puzzle.FEN.includes(" w ") ? "brancas" : "pretas",
        });

        game.reset();
        game.loadPosition(puzzle.FEN);

        setCurrentPuzzle(puzzle);
        setUserMoves([]);
        setFen(game.fen());
        setGameState(game.getGameState());
        setUserProgress(puzzleService.getUserProgress());
        setLastMove(null);
        setIsLastMoveCorrect(null);

        // Se for a vez das pretas, fazer o movimento inicial do computador imediatamente
        if (puzzle.FEN.includes(" b ")) {
          const expectedMoves = puzzle.Moves.split(" ");
          const userExpectedMoves = puzzle.FEN.includes(" w ")
            ? expectedMoves.filter((_, idx) => idx % 2 === 1)
            : expectedMoves.filter((_, idx) => idx % 2 === 0);
          const firstUserMove = userExpectedMoves[0];
          const [from, to] = [
            firstUserMove.slice(0, 2),
            firstUserMove.slice(2, 4),
          ];
          console.log("Fazendo movimento inicial do computador:", {
            from,
            to,
            fen: game.fen(),
          });
          await makeComputerMove(from as Square, to as Square);
        }
      }
    } catch (error) {
      console.error("Erro ao carregar puzzle:", error);
    } finally {
      setIsLoading(false);
    }
  }, [game, puzzleService, makeComputerMove]);

  useEffect(() => {
    loadNextPuzzleRef.current = loadNextPuzzle;
  }, [loadNextPuzzle]);

  useEffect(() => {
    let mounted = true;

    if (puzzleService && !currentPuzzle && mounted) {
      loadNextPuzzle();
    }

    return () => {
      mounted = false;
    };
  }, [puzzleService, loadNextPuzzle, currentPuzzle]);

  const value = {
    game,
    currentPuzzle,
    userProgress,
    fen,
    gameState,
    userMoves,
    isLoading,
    lastMove,
    isLastMoveCorrect,
    makeMove,
    loadNextPuzzle,
    isComputerMoving,
  };

  return (
    <PuzzleContext.Provider value={value}>{children}</PuzzleContext.Provider>
  );
}

export function usePuzzle() {
  const context = useContext(PuzzleContext);
  if (!context) {
    throw new Error("usePuzzle must be used within a PuzzleProvider");
  }
  return context;
}

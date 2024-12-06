"use client";

import { PuzzleProvider } from "@/contexts/PuzzleContext";
import { PuzzleBoard } from "@/components/chess/PuzzleBoard";
import { PuzzleProgress } from "@/components/chess/PuzzleProgress";
import { PuzzleInfo } from "@/components/chess/PuzzleInfo";
import { PuzzleMoveHistory } from "@/components/chess/PuzzleMoveHistory";

function PuzzleContent() {
  return (
    <main className="h-full">
      <div className="flex flex-col h-full p-4 w-full">
        <h1 className="text-3xl font-bold text-center mb-4">
          Puzzles de Xadrez
        </h1>

        <div className="grid grid-cols-3 gap-4 min-h-0 overflow-hidden">
          <div className="flex flex-col gap-4 col-span-2">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 w-full">
                <PuzzleBoard />
              </div>
              <div className="flex flex-col gap-4 col-span-1 h-full">
                <PuzzleProgress />
                <PuzzleInfo />
              </div>
            </div>
          </div>

          <PuzzleMoveHistory />
        </div>
      </div>
    </main>
  );
}

export default function PuzzlesPage() {
  return (
    <PuzzleProvider>
      <PuzzleContent />
    </PuzzleProvider>
  );
}

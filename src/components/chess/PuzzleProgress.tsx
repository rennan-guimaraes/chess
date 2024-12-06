import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { usePuzzle } from "@/contexts/PuzzleContext";

const PuzzleProgress = () => {
  const { userProgress, currentPuzzle, fen, isLoading } = usePuzzle();
  const currentTurn = fen.includes(" w ") ? "white" : "black";
  const playerColor = currentPuzzle?.FEN.includes(" w ") ? "white" : "black";
  const isPlayerTurn = currentTurn === playerColor;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Seu Progresso</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seu Progresso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rating:</span>
            <span className="font-bold">{userProgress.rating}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sequência Atual:</span>
            <span className="font-bold">{userProgress.currentStreak}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Melhor Sequência:</span>
            <span className="font-bold">{userProgress.bestStreak}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Resolvido:</span>
            <span className="font-bold">{userProgress.totalSolved}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Suas Peças:</span>
            <span className="font-bold">
              {playerColor === "white" ? "Brancas" : "Pretas"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vez:</span>
            <span
              className={`font-bold ${
                isPlayerTurn ? "text-green-600" : "text-red-600"
              }`}
            >
              {currentTurn === "white" ? "Brancas" : "Pretas"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { PuzzleProgress };

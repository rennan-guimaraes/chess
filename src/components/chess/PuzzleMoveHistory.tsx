import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { usePuzzle } from "@/contexts/PuzzleContext";

export function PuzzleMoveHistory() {
  const { gameState, isLoading } = usePuzzle();

  // Crie pares de movimentos (usuário e computador)
  const pairedMoves: Array<{ userMove: string; computerMove?: string }> = [];

  gameState.moveHistory.forEach((move) => {
    if (move.startsWith("c:")) {
      // Adicione o movimento do computador ao último par
      if (pairedMoves.length > 0) {
        pairedMoves[pairedMoves.length - 1].computerMove = move.slice(2);
      }
    } else {
      // Adicione um novo par para o movimento do usuário
      pairedMoves.push({ userMove: move });
    }
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Histórico de Movimentos</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pairedMoves.map((pair, index) => (
              <div key={index} className="flex gap-2">
                <div className="p-2 rounded bg-user-move">
                  {`${index + 1}. ${pair.userMove}`}
                </div>
                {pair.computerMove && (
                  <div className="p-2 rounded bg-computer-move">
                    {pair.computerMove}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

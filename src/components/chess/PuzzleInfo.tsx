import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { usePuzzle } from "@/contexts/PuzzleContext";

const PuzzleInfo = () => {
  const { currentPuzzle } = usePuzzle();

  if (!currentPuzzle) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações do Puzzle</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rating:</span>
            <span className="font-bold">{currentPuzzle.Rating}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tema:</span>
            <span className="font-bold capitalize">{currentPuzzle.theme}</span>
          </div>
          {currentPuzzle.Description && (
            <div>
              <span className="text-muted-foreground block mb-2">
                Descrição:
              </span>
              <p className="text-sm">{currentPuzzle.Description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export { PuzzleInfo };

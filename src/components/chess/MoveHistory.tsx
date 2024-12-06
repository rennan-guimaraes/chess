import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface MoveHistoryProps {
  moves: string[];
  currentMoveIndex: number;
}

export function MoveHistory({ moves, currentMoveIndex }: MoveHistoryProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Histórico de Movimentos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {moves.map((move: string, index: number) => (
            <div
              key={index}
              className={`p-2 rounded ${
                index === currentMoveIndex
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent"
              }`}
            >
              {`${Math.floor(index / 2) + 1}. ${move}`}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

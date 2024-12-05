import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { cn } from "@/lib/utils";

interface MoveHistoryProps {
  moves: string[];
  currentMoveIndex: number;
  onMoveSelect: (index: number) => void;
}

export function MoveHistory({
  moves,
  currentMoveIndex,
  onMoveSelect,
}: MoveHistoryProps) {
  return (
    <Card className="h-full">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">Movimentos</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <ScrollArea className="h-full">
          <div className="space-y-1 text-sm">
            {moves.map((move, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2 p-1 rounded cursor-pointer hover:bg-accent",
                  currentMoveIndex === index && "bg-accent"
                )}
                onClick={() => onMoveSelect(index)}
              >
                <span className="text-muted-foreground">{index + 1}.</span>
                <span>{move}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

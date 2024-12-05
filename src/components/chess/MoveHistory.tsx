import { ScrollArea } from "../ui/scroll-area";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface MoveHistoryProps {
  moves: string[];
}

export function MoveHistory({ moves }: MoveHistoryProps) {
  return (
    <Card className="h-full">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">Movimentos</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <ScrollArea className="h-[80px]">
          <div className="space-y-1 text-sm">
            {moves.map((move, index) => (
              <div key={index} className="flex items-center gap-2">
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

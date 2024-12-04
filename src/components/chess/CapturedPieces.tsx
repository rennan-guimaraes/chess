import { Card, CardTitle, CardHeader, CardContent } from "../ui/card";

interface CapturedPiecesProps {
  whitePieces: string[];
  blackPieces: string[];
}

export function CapturedPieces({
  whitePieces,
  blackPieces,
}: CapturedPiecesProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">Peças Capturadas</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted-foreground">Brancas: </span>
            <span>{whitePieces.join(" ")}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Pretas: </span>
            <span>{blackPieces.join(" ")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

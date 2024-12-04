import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface GameInfoProps {
  turn: "w" | "b";
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
}

export function GameInfo({
  turn,
  isCheck,
  isCheckmate,
  isDraw,
}: GameInfoProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">Estado do Jogo</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Turno:</span>
          <span className="font-medium">
            {turn === "w" ? "Brancas" : "Pretas"}
          </span>
        </div>
        {isCheck && <p className="text-red-500 font-semibold">Xeque!</p>}
        {isCheckmate && <p className="text-red-600 font-bold">Xeque-mate!</p>}
        {isDraw && <p className="text-blue-600 font-semibold">Empate!</p>}
      </CardContent>
    </Card>
  );
}

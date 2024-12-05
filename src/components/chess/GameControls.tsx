import { Button } from "../ui/button";
import { DifficultySelect } from "./DifficultySelect";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface GameControlsProps {
  onReset: () => void;
  onComputerMove: () => void;
  difficulty: number;
  onDifficultyChange: (value: number) => void;
  isComputerEnabled: boolean;
  onToggleComputer: () => void;
}

export function GameControls({
  onReset,
  onComputerMove,
  difficulty,
  onDifficultyChange,
  isComputerEnabled,
  onToggleComputer,
}: GameControlsProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg">Controles</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-2 space-y-4">
        <div className="flex flex-col gap-2">
          <Button
            onClick={onToggleComputer}
            variant={isComputerEnabled ? "destructive" : "default"}
          >
            {isComputerEnabled
              ? "Desativar Computador"
              : "Jogar contra Computador"}
          </Button>
          {isComputerEnabled && (
            <DifficultySelect
              difficulty={difficulty}
              onDifficultyChange={onDifficultyChange}
            />
          )}
        </div>
        <Button onClick={onReset} variant="outline" className="w-full">
          Reiniciar Jogo
        </Button>
      </CardContent>
    </Card>
  );
}

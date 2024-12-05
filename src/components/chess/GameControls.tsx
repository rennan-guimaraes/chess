import { Button } from "../ui/button";
import { DifficultySelect } from "./DifficultySelect";

interface GameControlsProps {
  onComputerMove: () => void;
  onResetGame: () => void;
  difficulty: number;
  onDifficultyChange: (value: number) => void;
}

export function GameControls({
  onComputerMove,
  onResetGame,
  difficulty,
  onDifficultyChange,
}: GameControlsProps) {
  return (
    <div className="flex gap-4 items-center">
      <DifficultySelect
        difficulty={difficulty}
        onDifficultyChange={onDifficultyChange}
      />
      <Button onClick={onComputerMove} className="flex-1" variant="secondary">
        Jogada do Computador
      </Button>
      <Button onClick={onResetGame} className="flex-1" variant="destructive">
        Reiniciar Jogo
      </Button>
    </div>
  );
}

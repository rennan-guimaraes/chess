import { Button } from "../ui/button";

interface GameControlsProps {
  onComputerMove: () => void;
  onResetGame: () => void;
}

export function GameControls({
  onComputerMove,
  onResetGame,
}: GameControlsProps) {
  return (
    <div className="flex gap-4">
      <Button onClick={onComputerMove} className="flex-1" variant="secondary">
        Jogada do Computador
      </Button>
      <Button onClick={onResetGame} className="flex-1" variant="destructive">
        Reiniciar Jogo
      </Button>
    </div>
  );
}

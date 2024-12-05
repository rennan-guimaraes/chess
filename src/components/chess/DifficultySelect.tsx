import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DifficultySelectProps {
  difficulty: number;
  onDifficultyChange: (value: number) => void;
}

export function DifficultySelect({
  difficulty,
  onDifficultyChange,
}: DifficultySelectProps) {
  return (
    <Select
      value={difficulty.toString()}
      onValueChange={(value) => onDifficultyChange(Number(value))}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Selecione a dificuldade" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="5">Iniciante</SelectItem>
        <SelectItem value="10">Intermediário</SelectItem>
        <SelectItem value="15">Avançado</SelectItem>
        <SelectItem value="20">Expert</SelectItem>
      </SelectContent>
    </Select>
  );
}

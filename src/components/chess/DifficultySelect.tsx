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

const difficultyLevels = [
  {
    value: 1,
    label: "Muito Fácil (ELO ~800)",
    description: "Para quem está começando",
  },
  { value: 3, label: "Fácil (ELO ~1000)", description: "Jogador iniciante" },
  {
    value: 5,
    label: "Iniciante (ELO ~1200)",
    description: "Conhece as regras básicas",
  },
  {
    value: 8,
    label: "Intermediário Básico (ELO ~1400)",
    description: "Jogador casual",
  },
  {
    value: 10,
    label: "Intermediário (ELO ~1600)",
    description: "Conhece algumas estratégias",
  },
  {
    value: 12,
    label: "Intermediário Avançado (ELO ~1800)",
    description: "Bom conhecimento tático",
  },
  { value: 15, label: "Avançado (ELO ~2000)", description: "Jogador de clube" },
  { value: 18, label: "Expert (ELO ~2200)", description: "Nível de mestre" },
  {
    value: 20,
    label: "Mestre (ELO ~2400)",
    description: "Jogador muito forte",
  },
  {
    value: 22,
    label: "Grande Mestre (ELO ~2600)",
    description: "Nível profissional",
  },
];

export function DifficultySelect({
  difficulty,
  onDifficultyChange,
}: DifficultySelectProps) {
  return (
    <Select
      value={difficulty.toString()}
      onValueChange={(value) => onDifficultyChange(Number(value))}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Selecione a dificuldade" />
      </SelectTrigger>
      <SelectContent>
        {difficultyLevels.map((level) => (
          <SelectItem
            key={level.value}
            value={level.value.toString()}
            className="flex flex-col"
          >
            <div className="flex flex-col">
              <span>{level.label}</span>
              <span className="text-xs text-muted-foreground">
                {level.description}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

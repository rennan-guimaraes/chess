import { Home, GraduationCap, Settings } from "lucide-react";
import { ThemeToggle } from "../theme/ThemeToggle";

export function Sidebar() {
  return (
    <div className="flex flex-col h-screen w-16 border-r bg-background">
      <div className="flex-1 flex flex-col items-center gap-4 py-4">
        <Home className="w-6 h-6 text-muted-foreground hover:text-foreground cursor-pointer" />
        <GraduationCap className="w-6 h-6 text-muted-foreground hover:text-foreground cursor-pointer" />
        <Settings className="w-6 h-6 text-muted-foreground hover:text-foreground cursor-pointer" />
      </div>
      <div className="border-t p-4">
        <ThemeToggle />
      </div>
    </div>
  );
}

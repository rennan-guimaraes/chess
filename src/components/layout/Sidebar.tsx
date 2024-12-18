"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "../theme/ThemeToggle";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    {
      href: "/",
      icon: Home,
      label: "Jogar",
    },
    {
      href: "/puzzles",
      icon: GraduationCap,
      label: "Puzzles",
    },
  ];

  return (
    <aside className="w-[60px] border-r flex flex-col items-center py-4 bg-background">
      <nav className="flex-1">
        <ul className="flex flex-col gap-4">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-md hover:bg-accent transition-colors",
                    pathname === link.href && "bg-accent"
                  )}
                  title={link.label}
                >
                  <Icon className="h-6 w-6" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto">
        <ThemeToggle />
      </div>
    </aside>
  );
}

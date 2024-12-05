"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
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
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="container flex justify-center items-center h-16">
        <ul className="flex gap-8">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors",
                    pathname === link.href && "text-foreground"
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

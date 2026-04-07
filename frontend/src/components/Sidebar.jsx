import { useTheme } from "@/hooks/useTheme";
import { Scale, Users, FolderOpen, Clock } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "./ui/button";

const navItems = [
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/processos", label: "Processos", icon: FolderOpen },
  { to: "/prazos", label: "Prazos", icon: Clock },
];

export default function Sidebar() {
  const { tema, alternarTema } = useTheme();

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-sidebar flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
        <Scale className="size-5" />
        <span className="font-semibold text-sm tracking-tight">
          JusDashboard
        </span>
      </div>
      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`
            }
          >
            <Icon className="size-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="flex items-center justify-center p-4 ">
        <Button variant="secondary" onClick={alternarTema}>
          Modo {tema === "dark" ? "☀️ Claro" : "🌙 Escuro"}
        </Button>
      </div>
    </aside>
  );
}

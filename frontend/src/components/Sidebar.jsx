import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Scale, Users, FolderOpen, Clock, LayoutDashboard, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const navItems = [
  { to: "/", label: "Painel", icon: LayoutDashboard, end: true },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/processos", label: "Processos", icon: FolderOpen },
  { to: "/prazos", label: "Prazos", icon: Clock },
];

export default function Sidebar() {
  const { tema, alternarTema } = useTheme();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-sidebar flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-border">
        <Scale className="size-5" />
        <span className="font-semibold text-sm tracking-tight">
          JusDashboard
        </span>
      </div>
      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
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
      <div className="flex flex-col gap-2 p-4 border-t border-border">
        {usuario && (
          <p className="text-xs text-muted-foreground truncate px-1">
            {usuario.nome}
          </p>
        )}
        <Button variant="secondary" onClick={alternarTema}>
          Modo {tema === "dark" ? "☀️ Claro" : "🌙 Escuro"}
        </Button>
        <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground">
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}

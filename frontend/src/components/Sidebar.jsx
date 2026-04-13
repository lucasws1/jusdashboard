import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Scale, Users, FolderOpen, Clock, LayoutDashboard, LogOut, Search } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import BuscaGlobal from "./BuscaGlobal";

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
  const [buscaAberta, setBuscaAberta] = useState(false);

  // Atalho global Ctrl+K / Cmd+K
  useEffect(() => {
    function handler(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setBuscaAberta(true);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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
      {/* Botão de busca global */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setBuscaAberta(true)}
          className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="flex-1 text-left">Buscar...</span>
          <kbd className="hidden sm:inline-flex items-center rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-mono">
            ⌘K
          </kbd>
        </button>
      </div>

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

      <BuscaGlobal aberto={buscaAberta} onFechar={() => setBuscaAberta(false)} />
    </aside>
  );
}

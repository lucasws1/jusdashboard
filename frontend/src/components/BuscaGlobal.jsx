import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarClientes } from "@/api/clientes";
import { listarProcessos } from "@/api/processos";
import { listarPrazos } from "@/api/prazos";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Users, FolderOpen, CalendarClock, Loader2 } from "lucide-react";

const DEBOUNCE_MS = 300;
const MIN_CHARS = 2;

function GrupoResultados({ icone: Icone, titulo, itens, onSelecionar }) {
  if (itens.length === 0) return null;
  return (
    <div>
      <div className="flex items-center gap-1.5 px-3 py-1.5">
        <Icone className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {titulo}
        </span>
      </div>
      {itens.map((item) => (
        <button
          key={item.id}
          className="w-full text-left flex flex-col gap-0.5 px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
          onClick={() => onSelecionar(item.href)}
        >
          <span className="text-sm font-medium truncate">{item.titulo}</span>
          {item.subtitulo && (
            <span className="text-xs text-muted-foreground truncate">
              {item.subtitulo}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default function BuscaGlobal({ aberto, onFechar }) {
  const [query, setQuery] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [prazos, setPrazos] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Foca o input quando o modal abre
  useEffect(() => {
    if (aberto) {
      setQuery("");
      setClientes([]);
      setProcessos([]);
      setPrazos([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [aberto]);

  // Busca com debounce
  useEffect(() => {
    if (query.length < MIN_CHARS) {
      setClientes([]);
      setProcessos([]);
      setPrazos([]);
      return;
    }

    const timer = setTimeout(async () => {
      setCarregando(true);
      try {
        const [resClientes, resProcessos, resPrazos] = await Promise.all([
          listarClientes(query),
          listarProcessos({ busca: query }),
          listarPrazos({ busca: query }),
        ]);
        setClientes(resClientes.data.slice(0, 5));
        setProcessos(resProcessos.data.slice(0, 5));
        setPrazos(resPrazos.data.slice(0, 5));
      } catch {
        // falha silenciosa — o usuário pode tentar novamente
      } finally {
        setCarregando(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  function selecionar(href) {
    onFechar();
    navigate(href);
  }

  const itensClientes = clientes.map((c) => ({
    id: c.id,
    titulo: c.nome,
    subtitulo: [c.cpf_cnpj, c.email].filter(Boolean).join(" · "),
    href: `/clientes/${c.id}`,
  }));

  const itensProcessos = processos.map((p) => ({
    id: p.id,
    titulo: p.titulo,
    subtitulo: [p.numero_processo, p.area].filter(Boolean).join(" · "),
    href: `/processos/${p.id}`,
  }));

  const itensPrazos = prazos.map((p) => ({
    id: p.id,
    titulo: p.descricao,
    subtitulo: [
      p.processo_titulo,
      p.data_prazo
        ? new Date(p.data_prazo).toLocaleDateString("pt-BR")
        : null,
    ]
      .filter(Boolean)
      .join(" · "),
    href: `/processos/${p.processo_id}`,
  }));

  const semResultados =
    query.length >= MIN_CHARS &&
    !carregando &&
    itensClientes.length === 0 &&
    itensProcessos.length === 0 &&
    itensPrazos.length === 0;

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
        {/* Input de busca */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          {carregando ? (
            <Loader2 className="size-4 text-muted-foreground shrink-0 animate-spin" />
          ) : (
            <Search className="size-4 text-muted-foreground shrink-0" />
          )}
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar clientes, processos, prazos..."
            className="border-0 shadow-none focus-visible:ring-0 p-0 h-auto text-base"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            Esc
          </kbd>
        </div>

        {/* Resultados */}
        <div className="flex flex-col gap-1 p-2 max-h-[420px] overflow-y-auto">
          {query.length < MIN_CHARS && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Digite ao menos {MIN_CHARS} caracteres para buscar.
            </p>
          )}

          {semResultados && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum resultado para{" "}
              <span className="font-medium text-foreground">"{query}"</span>.
            </p>
          )}

          <GrupoResultados
            icone={Users}
            titulo="Clientes"
            itens={itensClientes}
            onSelecionar={selecionar}
          />
          <GrupoResultados
            icone={FolderOpen}
            titulo="Processos"
            itens={itensProcessos}
            onSelecionar={selecionar}
          />
          <GrupoResultados
            icone={CalendarClock}
            titulo="Prazos"
            itens={itensPrazos}
            onSelecionar={selecionar}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listarClientes } from "@/api/clientes";
import { listarProcessos } from "@/api/processos";
import { listarPrazos } from "@/api/prazos";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  Users,
  FolderOpen,
  CalendarClock,
  Gavel,
  ArrowRight,
  Loader2,
  AlertCircle,
  CalendarDays,
} from "lucide-react";

const STATUS_CORES_PRAZO = {
  pendente: "default",
  concluido: "secondary",
  cancelado: "outline",
};

function diasAte(dataStr) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const d = new Date(dataStr);
  d.setHours(0, 0, 0, 0);
  return Math.round((d - hoje) / (1000 * 60 * 60 * 24));
}

function LabelDias({ dias }) {
  if (dias < 0)
    return (
      <span className="text-destructive font-medium text-xs">
        Vencido há {Math.abs(dias)}d
      </span>
    );
  if (dias === 0)
    return <span className="text-orange-500 font-medium text-xs">Hoje</span>;
  if (dias === 1)
    return <span className="text-orange-500 font-medium text-xs">Amanhã</span>;
  if (dias <= 3)
    return (
      <span className="text-orange-500 font-medium text-xs">{dias} dias</span>
    );
  return <span className="text-muted-foreground text-xs">{dias} dias</span>;
}

// ─── Card contador ────────────────────────────────────────────────────────────
function CardContador({ icon: Icon, label, valor, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-3 rounded-xl bg-card ring-1 ring-foreground/10 p-5 text-left transition-colors hover:bg-muted/30 w-full"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">
          {label}
        </span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-semibold tracking-tight">
          {valor ?? <Loader2 className="animate-spin size-5" />}
        </span>
        {sub && (
          <span className="text-xs text-muted-foreground mb-1">{sub}</span>
        )}
      </div>
    </button>
  );
}

// ─── Tabela de prazos compacta ────────────────────────────────────────────────
function TabelaPrazos({ prazos, processos, navigate, titulo, vazio }) {
  return (
    <div className="flex flex-col gap-3">
      {prazos.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          {vazio}
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {prazos.map((p) => {
            const proc = processos.find((pr) => pr.id === p.processo_id);
            const dias = diasAte(p.data_prazo);
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 py-3 group cursor-pointer"
                onClick={() => navigate(`/processos/${p.processo_id}`)}
              >
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                    {p.descricao}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-muted-foreground font-mono truncate">
                      {proc?.numero_processo || `#${p.processo_id}`}
                    </span>
                    {p.tipo && (
                      <>
                        <span className="text-muted-foreground text-xs">·</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {p.tipo}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-0.5 shrink-0">
                  <span className="text-xs text-muted-foreground">
                    {new Date(p.data_prazo).toLocaleDateString("pt-BR")}
                  </span>
                  <LabelDias dias={dias} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();

  const [carregando, setCarregando] = useState(true);
  const [totalClientes, setTotalClientes] = useState(null);
  const [totalProcessosAtivos, setTotalProcessosAtivos] = useState(null);
  const [prazosProximos, setPrazosProximos] = useState([]);
  const [audienciasProximas, setAudienciasProximas] = useState([]);
  const [processosRecentes, setProcessosRecentes] = useState([]);
  const [processos, setProcessos] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        const [{ data: clientes }, { data: procs }, { data: prazos }] =
          await Promise.all([
            listarClientes(),
            listarProcessos({ status: "ativo" }),
            listarPrazos({ status: "pendente" }),
          ]);

        const todosProcessos = (await listarProcessos()).data;

        setTotalClientes(clientes.length);
        setTotalProcessosAtivos(procs.length);
        setProcessos(todosProcessos);

        // ordena por data
        const ordenados = [...prazos].sort(
          (a, b) => new Date(a.data_prazo) - new Date(b.data_prazo),
        );

        // próximos 30 dias (excluindo audiências)
        const em30dias = ordenados.filter((p) => {
          const d = diasAte(p.data_prazo);
          return d <= 30 && p.tipo !== "audiência";
        });
        setPrazosProximos(em30dias.slice(0, 8));

        // audiências dos próximos 60 dias
        const audiencias = ordenados.filter((p) => {
          const d = diasAte(p.data_prazo);
          return p.tipo === "audiência" && d <= 60;
        });
        setAudienciasProximas(audiencias.slice(0, 6));

        // 5 processos mais recentes (por updated_at)
        const recentes = [...todosProcessos]
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
          .slice(0, 5);
        setProcessosRecentes(recentes);
      } catch (err) {
        console.error("Erro ao carregar dados da Home:", err);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  const prazosUrgentes = prazosProximos.filter(
    (p) => diasAte(p.data_prazo) <= 7,
  );

  return (
    <div className="flex flex-col gap-8 p-6 max-w-5xl mx-auto w-full">
      {/* Saudação */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Painel</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Visão geral do escritório.
        </p>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <CardContador
          icon={Users}
          label="Clientes"
          valor={totalClientes}
          onClick={() => navigate("/clientes")}
        />
        <CardContador
          icon={FolderOpen}
          label="Processos ativos"
          valor={totalProcessosAtivos}
          onClick={() => navigate("/processos")}
        />
        <CardContador
          icon={CalendarClock}
          label="Prazos pendentes"
          valor={carregando ? null : prazosProximos.length}
          sub="próx. 30 dias"
          onClick={() => navigate("/prazos")}
        />
        <CardContador
          icon={Gavel}
          label="Audiências"
          valor={carregando ? null : audienciasProximas.length}
          sub="próx. 60 dias"
          onClick={() => navigate("/prazos")}
        />
      </div>

      {/* Alerta de urgência */}
      {!carregando && prazosUrgentes.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-orange-500/30 bg-orange-500/5 px-4 py-3">
          <AlertCircle className="size-4 text-orange-500 mt-0.5 shrink-0" />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
              {prazosUrgentes.length}{" "}
              {prazosUrgentes.length === 1 ? "prazo vence" : "prazos vencem"}{" "}
              nos próximos 7 dias
            </span>
            <span className="text-xs text-muted-foreground">
              Verifique a lista de prazos abaixo.
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto shrink-0 text-orange-600 dark:text-orange-400 hover:text-orange-700"
            onClick={() => navigate("/prazos")}
          >
            Ver todos
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      )}

      {/* Conteúdo principal: 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prazos próximos (exceto audiências) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="size-4" />
                  Prazos próximos
                </CardTitle>
                <CardDescription>
                  Próximos 30 dias, exceto audiências
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/prazos")}
                className="text-muted-foreground"
              >
                Ver todos <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin size-5 text-muted-foreground" />
              </div>
            ) : (
              <TabelaPrazos
                prazos={prazosProximos}
                processos={processos}
                navigate={navigate}
                vazio="Nenhum prazo nos próximos 30 dias."
              />
            )}
          </CardContent>
        </Card>

        {/* Audiências */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="size-4" />
                  Audiências
                </CardTitle>
                <CardDescription>Próximos 60 dias</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/prazos")}
                className="text-muted-foreground"
              >
                Ver todas <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {carregando ? (
              <div className="flex justify-center py-6">
                <Loader2 className="animate-spin size-5 text-muted-foreground" />
              </div>
            ) : (
              <TabelaPrazos
                prazos={audienciasProximas}
                processos={processos}
                navigate={navigate}
                vazio="Nenhuma audiência nos próximos 60 dias."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Processos recentes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="size-4" />
                Processos recentes
              </CardTitle>
              <CardDescription>Últimos 5 atualizados</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/processos")}
              className="text-muted-foreground"
            >
              Ver todos <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {carregando ? (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin size-5 text-muted-foreground" />
            </div>
          ) : processosRecentes.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Nenhum processo cadastrado.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {processosRecentes.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 py-3 cursor-pointer group"
                  onClick={() => navigate(`/processos/${p.id}`)}
                >
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                      {p.titulo}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground font-mono">
                        {p.numero_processo || `#${p.id}`}
                      </span>
                      {p.area && (
                        <>
                          <span className="text-muted-foreground text-xs">
                            ·
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {p.area}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={
                        p.status === "ativo"
                          ? "default"
                          : p.status === "suspenso"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {p.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(p.updated_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

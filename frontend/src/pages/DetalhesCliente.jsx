import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obterCliente } from "@/api/clientes";
import { listarProcessos } from "@/api/processos";
import { listarPrazos } from "@/api/prazos";
import { useModal } from "@/hooks/useModal";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ModalConfirmarExclusao from "@/components/shared/ModalConfirmarExclusao";
import ModalProcesso from "@/components/processos/ModalProcesso";
import {
  atualizarProcesso,
  criarProcesso,
  deletarProcesso,
} from "@/api/processos";

import {
  ArrowLeft,
  Loader2,
  Info,
  FolderOpen,
  CalendarClock,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Pencil,
  Trash2,
  Plus,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

function formatarData(data) {
  if (!data) return "—";
  return new Date(data).toLocaleDateString("pt-BR");
}

const STATUS_CORES_PROCESSO = {
  ativo: "default",
  suspenso: "secondary",
  arquivado: "outline",
  encerrado: "outline",
};

const STATUS_CORES_PRAZO = {
  pendente: "default",
  concluido: "secondary",
  cancelado: "outline",
};

// ─── Tab Info ────────────────────────────────────────────────────────────────
function TabInfo({ cliente }) {
  const campos = [
    { icon: CreditCard, label: "CPF / CNPJ", value: cliente?.cpf_cnpj },
    { icon: Mail, label: "E-mail", value: cliente?.email },
    { icon: Phone, label: "Telefone", value: cliente?.telefone },
    { icon: MapPin, label: "Endereço", value: cliente?.endereco },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {campos.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col gap-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wide">
              <Icon className="size-3.5" />
              {label}
            </span>
            <span className="text-sm text-foreground">{value || "—"}</span>
          </div>
        ))}
      </div>

      {cliente?.observacoes && (
        <>
          <Separator />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Observações
            </span>
            <p className="text-sm text-foreground leading-relaxed">
              {cliente.observacoes}
            </p>
          </div>
        </>
      )}

      <Separator />
      <div className="flex gap-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Cliente desde</span>
          <span className="text-sm">{formatarData(cliente?.created_at)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Atualizado em</span>
          <span className="text-sm">{formatarData(cliente?.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Tab Processos ────────────────────────────────────────────────────────────
function TabProcessos({ clienteId, cliente }) {
  const navigate = useNavigate();
  const [processos, setProcessos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const {
    aberto,
    itemEditando,
    itemParaExcluir,
    abrirNovo,
    abrirEdicao,
    fechar,
    confirmarExclusao,
    cancelarExclusao,
  } = useModal();

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const { data } = await listarProcessos({ cliente_id: clienteId });
      setProcessos(data);
    } finally {
      setCarregando(false);
    }
  }, [clienteId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleSalvar = async (dados) => {
    // cliente_id sempre vem do contexto
    const payload = { ...dados, cliente_id: clienteId };
    if (itemEditando) {
      await atualizarProcesso(itemEditando.id, payload);
    } else {
      await criarProcesso(payload);
    }
    await carregar();
  };

  const handleExcluir = async () => {
    await deletarProcesso(itemParaExcluir.id);
    cancelarExclusao();
    await carregar();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          {processos.length} {processos.length === 1 ? "processo" : "processos"}
        </span>
        <Button size="sm" onClick={abrirNovo}>
          <Plus /> Novo processo
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Número</th>
              <th className="text-left px-4 py-2.5 font-medium">Título</th>
              <th className="text-left px-4 py-2.5 font-medium">Área</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  <Loader2 className="animate-spin mx-auto size-4" />
                </td>
              </tr>
            )}
            {!carregando && processos.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground text-sm"
                >
                  Nenhum processo cadastrado.
                </td>
              </tr>
            )}
            {!carregando &&
              processos.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Button
                      variant="link"
                      className="h-auto p-0 font-medium font-mono text-xs"
                      onClick={() => navigate(`/processos/${p.id}`)}
                    >
                      {p.numero_processo || `#${p.id}`}
                      <ExternalLink className="size-3 ml-1" />
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.titulo}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.area || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={STATUS_CORES_PROCESSO[p.status] ?? "outline"}
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => navigate(`/processos/${p.id}`)}
                        title="Ver detalhes"
                      >
                        <ExternalLink />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => abrirEdicao(p)}
                        title="Editar"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => confirmarExclusao(p)}
                        title="Excluir"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <ModalProcesso
        aberto={aberto}
        onFechar={fechar}
        processoEditando={itemEditando}
        onSalvar={handleSalvar}
        clientes={cliente ? [cliente] : []}
        ocultarClienteId
      />
      <ModalConfirmarExclusao
        item={itemParaExcluir}
        onConfirmar={handleExcluir}
        onCancelar={cancelarExclusao}
      />
    </>
  );
}

// ─── Tab Prazos próximos ──────────────────────────────────────────────────────
function TabPrazos({ clienteId }) {
  const navigate = useNavigate();
  const [prazos, setPrazos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [processos, setProcessos] = useState([]);

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true);
      try {
        // busca todos os processos do cliente para cruzar com prazos
        const { data: procs } = await listarProcessos({
          cliente_id: clienteId,
        });
        setProcessos(procs);

        // busca prazos pendentes de cada processo do cliente
        const resultados = await Promise.all(
          procs.map((p) =>
            listarPrazos({ processo_id: p.id, status: "pendente" }).then(
              (res) => res.data,
            ),
          ),
        );
        const todos = resultados
          .flat()
          .sort((a, b) => new Date(a.data_prazo) - new Date(b.data_prazo));
        setPrazos(todos);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, [clienteId]);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const diasAte = (dataStr) => {
    const d = new Date(dataStr);
    d.setHours(0, 0, 0, 0);
    return Math.round((d - hoje) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {prazos.length}{" "}
          {prazos.length === 1 ? "prazo pendente" : "prazos pendentes"}
        </span>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Processo</th>
              <th className="text-left px-4 py-2.5 font-medium">Descrição</th>
              <th className="text-left px-4 py-2.5 font-medium">Tipo</th>
              <th className="text-left px-4 py-2.5 font-medium">Data</th>
              <th className="text-left px-4 py-2.5 font-medium">Faltam</th>
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  <Loader2 className="animate-spin mx-auto size-4" />
                </td>
              </tr>
            )}
            {!carregando && prazos.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground text-sm"
                >
                  Nenhum prazo pendente.
                </td>
              </tr>
            )}
            {!carregando &&
              prazos.map((p) => {
                const proc = processos.find((pr) => pr.id === p.processo_id);
                const dias = diasAte(p.data_prazo);
                const urgente = dias <= 3;
                const vencido = dias < 0;

                return (
                  <tr
                    key={p.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Button
                        variant="link"
                        className="h-auto p-0 font-mono text-xs"
                        onClick={() => navigate(`/processos/${p.processo_id}`)}
                      >
                        {proc?.numero_processo || `#${p.processo_id}`}
                      </Button>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.descricao}
                    </td>
                    <td className="px-4 py-3">
                      {p.tipo ? (
                        <Badge variant="secondary">
                          {p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1)}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(p.data_prazo).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          vencido
                            ? "text-destructive font-medium"
                            : urgente
                              ? "text-orange-500 font-medium"
                              : "text-muted-foreground"
                        }
                      >
                        {vencido
                          ? `Vencido há ${Math.abs(dias)}d`
                          : dias === 0
                            ? "Hoje"
                            : dias === 1
                              ? "Amanhã"
                              : `${dias} dias`}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function DetalhesCliente() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [totalProcessos, setTotalProcessos] = useState(0);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const { data: cli } = await obterCliente(id);
        const { data: procs } = await listarProcessos({ cliente_id: id });
        setCliente(cli);
        setTotalProcessos(procs.length);
      } catch (err) {
        console.error("Erro ao carregar cliente:", err);
      } finally {
        setCarregando(false);
      }
    };
    carregarDados();
  }, [id]);

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin size-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
      {/* Cabeçalho */}
      <div className="flex items-start gap-4">
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => navigate(-1)}
              title="Voltar"
            >
              <ArrowLeft />
            </Button>
            <h1 className="text-xl font-semibold">
              {cliente?.nome || "Cliente"}
            </h1>
          </div>
          <div className="flex items-center gap-2 pl-8">
            {cliente?.cpf_cnpj && (
              <Badge variant="outline" className="font-mono text-xs">
                {cliente.cpf_cnpj}
              </Badge>
            )}
            <Badge variant="secondary">
              {totalProcessos} {totalProcessos === 1 ? "processo" : "processos"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">
            <Info />
            Info
          </TabsTrigger>
          <TabsTrigger value="processos">
            <FolderOpen />
            Processos
          </TabsTrigger>
          <TabsTrigger value="prazos">
            <CalendarClock />
            Prazos pendentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <TabInfo cliente={cliente} />
        </TabsContent>

        <TabsContent value="processos" className="mt-4">
          <TabProcessos clienteId={Number(id)} cliente={cliente} />
        </TabsContent>

        <TabsContent value="prazos" className="mt-4">
          <TabPrazos clienteId={Number(id)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

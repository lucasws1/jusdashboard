import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { obterCliente } from "@/api/clientes";
import { obterProcesso } from "@/api/processos";
import {
  listarAndamentos,
  criarAndamento,
  atualizarAndamento,
  deletarAndamento,
} from "@/api/andamentos";
import {
  listarPrazos,
  criarPrazo,
  atualizarPrazo,
  deletarPrazo,
} from "@/api/prazos";
import {
  listarLancamentos,
  criarLancamento,
  atualizarLancamento,
  deletarLancamento,
} from "@/api/lancamentos";
import { useModal } from "@/hooks/useModal";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ModalConfirmarExclusao from "@/components/shared/ModalConfirmarExclusao";
import ModalPrazo from "@/components/prazos/ModalPrazo";
import ModalAndamento from "@/components/andamentos/ModalAndamento";
import ModalLancamento from "@/components/lancamentos/ModalLancamento";

import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  CalendarClock,
  ScrollText,
  Info,
  Building2,
  User,
  Hash,
  FileText,
  Clock,
  Wallet,
} from "lucide-react";

function formatarData(data) {
  if (!data) return "—";
  return new Date(data).toLocaleDateString("pt-BR");
}

function formatarMoeda(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const LABELS_TIPO = {
  honorario: "Honorário",
  custa: "Custa",
  deposito: "Depósito",
  reembolso: "Reembolso",
  outro: "Outro",
};

const STATUS_CORES = {
  ativo: "default",
  suspenso: "secondary",
  arquivado: "outline",
  encerrado: "outline",
  pendente: "default",
  concluido: "secondary",
  cancelado: "outline",
};

// ─── Sub-componente: painel de informações ─────────────────────────────────────
function TabInfo({ processo, cliente }) {
  const campos = [
    { icon: User, label: "Cliente", value: cliente?.nome },
    { icon: Hash, label: "Número", value: processo?.numero_processo },
    { icon: FileText, label: "Título", value: processo?.titulo },
    { icon: ScrollText, label: "Área", value: processo?.area },
    { icon: ScrollText, label: "Tipo", value: processo?.tipo },
    {
      icon: Building2,
      label: "Vara / Tribunal",
      value: processo?.vara_tribunal,
    },
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

      {processo?.observacoes && (
        <>
          <Separator />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Observações
            </span>
            <p className="text-sm text-foreground leading-relaxed">
              {processo.observacoes}
            </p>
          </div>
        </>
      )}

      <Separator />
      <div className="flex gap-6">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Criado em</span>
          <span className="text-sm">{formatarData(processo?.created_at)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Atualizado em</span>
          <span className="text-sm">{formatarData(processo?.updated_at)}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componente: tabela de prazos ─────────────────────────────────────────
function TabPrazos({ processoId }) {
  const [prazos, setPrazos] = useState([]);
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
      const { data } = await listarPrazos({ processo_id: processoId });
      setPrazos(data);
    } finally {
      setCarregando(false);
    }
  }, [processoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleSalvar = async (dados) => {
    const payload = { ...dados, processo_id: processoId };
    if (itemEditando) {
      await atualizarPrazo(itemEditando.id, payload);
    } else {
      await criarPrazo(payload);
    }
    await carregar();
  };

  const handleExcluir = async () => {
    await deletarPrazo(itemParaExcluir.id);
    cancelarExclusao();
    await carregar();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          {prazos.length} {prazos.length === 1 ? "prazo" : "prazos"}
        </span>
        <Button size="sm" onClick={abrirNovo}>
          <Plus /> Novo prazo
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Descrição</th>
              <th className="text-left px-4 py-2.5 font-medium">Tipo</th>
              <th className="text-left px-4 py-2.5 font-medium">Data</th>
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
            {!carregando && prazos.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground text-sm"
                >
                  Nenhum prazo cadastrado.
                </td>
              </tr>
            )}
            {!carregando &&
              prazos.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">{p.descricao}</td>
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
                    {formatarData(p.data_prazo)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_CORES[p.status] ?? "outline"}>
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => abrirEdicao(p)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmarExclusao(p)}
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

      <ModalPrazo
        aberto={aberto}
        onFechar={fechar}
        prazoEditando={itemEditando}
        onSalvar={handleSalvar}
        ocultarProcessoId
      />
      <ModalConfirmarExclusao
        item={itemParaExcluir}
        onConfirmar={handleExcluir}
        onCancelar={cancelarExclusao}
      />
    </>
  );
}

// ─── Sub-componente: tabela de andamentos ─────────────────────────────────────
function TabAndamentos({ processoId }) {
  const [andamentos, setAndamentos] = useState([]);
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
      const { data } = await listarAndamentos({ processo_id: processoId });
      setAndamentos(data);
    } finally {
      setCarregando(false);
    }
  }, [processoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleSalvar = async (dados) => {
    const payload = { ...dados, processo_id: processoId };
    if (itemEditando) {
      await atualizarAndamento(itemEditando.id, payload);
    } else {
      await criarAndamento(payload);
    }
    await carregar();
  };

  const handleExcluir = async () => {
    await deletarAndamento(itemParaExcluir.id);
    cancelarExclusao();
    await carregar();
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          {andamentos.length}{" "}
          {andamentos.length === 1 ? "andamento" : "andamentos"}
        </span>
        <Button size="sm" onClick={abrirNovo}>
          <Plus /> Novo andamento
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Data</th>
              <th className="text-left px-4 py-2.5 font-medium">Tipo</th>
              <th className="text-left px-4 py-2.5 font-medium">Descrição</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  <Loader2 className="animate-spin mx-auto size-4" />
                </td>
              </tr>
            )}
            {!carregando && andamentos.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-muted-foreground text-sm"
                >
                  Nenhum andamento cadastrado.
                </td>
              </tr>
            )}
            {!carregando &&
              andamentos.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatarData(a.data_andamento)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.tipo || "-"}
                  </td>
                  <td className="px-4 py-3">{a.descricao}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => abrirEdicao(a)}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmarExclusao(a)}
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

      <ModalAndamento
        aberto={aberto}
        onFechar={fechar}
        andamentoEditando={itemEditando}
        onSalvar={handleSalvar}
      />
      <ModalConfirmarExclusao
        item={itemParaExcluir}
        onConfirmar={handleExcluir}
        onCancelar={cancelarExclusao}
      />
    </>
  );
}

// ─── Sub-componente: financeiro ───────────────────────────────────────────────
function TabFinanceiro({ processoId }) {
  const [lancamentos, setLancamentos] = useState([]);
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
      const { data } = await listarLancamentos({ processo_id: processoId });
      setLancamentos(data);
    } finally {
      setCarregando(false);
    }
  }, [processoId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const handleSalvar = async (dados) => {
    const payload = { ...dados, processo_id: processoId };
    if (itemEditando) {
      await atualizarLancamento(itemEditando.id, payload);
    } else {
      await criarLancamento(payload);
    }
    await carregar();
  };

  const handleExcluir = async () => {
    await deletarLancamento(itemParaExcluir.id);
    cancelarExclusao();
    await carregar();
  };

  const honorariosPagos = lancamentos
    .filter((l) => l.tipo === "honorario" && l.data_pagamento)
    .reduce((s, l) => s + Number(l.valor), 0);

  const honorariosPendentes = lancamentos
    .filter((l) => l.tipo === "honorario" && !l.data_pagamento)
    .reduce((s, l) => s + Number(l.valor), 0);

  const totalCustas = lancamentos
    .filter((l) => l.tipo !== "honorario")
    .reduce((s, l) => s + Number(l.valor), 0);

  return (
    <>
      {/* Resumo */}
      {!carregando && lancamentos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Honorários recebidos</span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {formatarMoeda(honorariosPagos)}
            </span>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Honorários pendentes</span>
            <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
              {formatarMoeda(honorariosPendentes)}
            </span>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Total de custas</span>
            <span className="text-sm font-medium">{formatarMoeda(totalCustas)}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-muted-foreground">
          {lancamentos.length}{" "}
          {lancamentos.length === 1 ? "lançamento" : "lançamentos"}
        </span>
        <Button size="sm" onClick={abrirNovo}>
          <Plus /> Novo lançamento
        </Button>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5 font-medium">Descrição</th>
              <th className="text-left px-4 py-2.5 font-medium">Tipo</th>
              <th className="text-left px-4 py-2.5 font-medium">Valor</th>
              <th className="text-left px-4 py-2.5 font-medium">Vencimento</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  <Loader2 className="animate-spin mx-auto size-4" />
                </td>
              </tr>
            )}
            {!carregando && lancamentos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  Nenhum lançamento cadastrado.
                </td>
              </tr>
            )}
            {!carregando &&
              lancamentos.map((l) => (
                <tr
                  key={l.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">{l.descricao}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {LABELS_TIPO[l.tipo] ?? l.tipo}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums whitespace-nowrap">
                    {formatarMoeda(l.valor)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {formatarData(l.data_vencimento)}
                  </td>
                  <td className="px-4 py-3">
                    {l.data_pagamento ? (
                      <Badge variant="secondary">Pago</Badge>
                    ) : (
                      <Badge variant="outline">Pendente</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => abrirEdicao(l)}>
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmarExclusao(l)}
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

      <ModalLancamento
        aberto={aberto}
        onFechar={fechar}
        lancamentoEditando={itemEditando}
        onSalvar={handleSalvar}
      />
      <ModalConfirmarExclusao
        item={itemParaExcluir}
        onConfirmar={handleExcluir}
        onCancelar={cancelarExclusao}
      />
    </>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function DetalhesProcesso() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [processo, setProcesso] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const { data: proc } = await obterProcesso(id);
        const { data: cli } = await obterCliente(proc.cliente_id);
        setCliente(cli);
        setProcesso(proc);
      } catch (error) {
        console.error("Erro ao obter processo:", error);
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
      <div className="flex items-start justify-center gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate(-1)} title="Voltar">
              <ArrowLeft />
            </Button>
            <h1 className="text-xl font-semibold">
              {processo?.titulo || "Processo"}
            </h1>
          </div>
          <div className="flex items-center gap-2 pl-8">
            <Badge variant="outline" className="font-mono text-xs">
              {processo?.numero_processo || "Sem número"}
            </Badge>
            <Badge variant={STATUS_CORES[processo?.status] ?? "outline"}>
              {processo?.status}
            </Badge>
            {processo?.area && (
              <Badge variant="secondary">{processo.area}</Badge>
            )}
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
          <TabsTrigger value="prazos">
            <CalendarClock />
            Prazos
          </TabsTrigger>
          <TabsTrigger value="andamentos">
            <Clock />
            Andamentos
          </TabsTrigger>
          <TabsTrigger value="financeiro">
            <Wallet />
            Financeiro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <TabInfo processo={processo} cliente={cliente} />
        </TabsContent>

        <TabsContent value="prazos" className="mt-4">
          <TabPrazos processoId={Number(id)} />
        </TabsContent>

        <TabsContent value="andamentos" className="mt-4">
          <TabAndamentos processoId={Number(id)} />
        </TabsContent>

        <TabsContent value="financeiro" className="mt-4">
          <TabFinanceiro processoId={Number(id)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

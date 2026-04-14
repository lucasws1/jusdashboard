import { useEffect, useState, useCallback } from "react";
import { useModal } from "@/hooks/useModal";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  UserX,
  CalendarIcon,
  CalendarDays,
  X,
  Download,
  FileText,
  Table2,
  ChevronDown,
} from "lucide-react";
import { exportarPDF, exportarExcel } from "@/lib/exportar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  atualizarPrazo,
  criarPrazo,
  deletarPrazo,
  listarPrazos,
} from "@/api/prazos";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listarProcessos, obterProcesso } from "@/api/processos";
import ModalConfirmarExclusao from "@/components/shared/ModalConfirmarExclusao";
import ModalPrazo from "@/components/prazos/ModalPrazo";
import PrazosCalendario from "@/components/prazos/PrazosCalendario";

const TIPOS_PRAZO = [
  "audiência",
  "recurso",
  "contrarrazões",
  "laudo pericial",
  "manifestação",
  "contestação",
  "embargos",
  "petição",
  "outros",
];

const STATUS_CORES = {
  pendente: "default",
  concluido: "secondary",
  cancelado: "outline",
};

function toApiDate(date) {
  return date ? format(date, "yyyy-MM-dd") : "";
}

function DatePickerFiltro({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-36 justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 size-4 text-muted-foreground" />
            {value ? (
              format(value, "dd/MM/yyyy")
            ) : (
              <span className="text-muted-foreground">dd/mm/aaaa</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            locale={ptBR}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {value && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onChange(undefined)}
          title="Limpar data"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  );
}

export default function Prazos() {
  const [searchParams] = useSearchParams();
  const processoIdFiltro = searchParams.get("processo_id");

  const [prazos, setPrazos] = useState([]);
  const [processos, setProcessos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState("");
  const [processoTitulo, setProcessoTitulo] = useState("");
  const [modoVisualizacao, setModoVisualizacao] = useState("tabela");

  // filtros
  const [statusFiltro, setStatusFiltro] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [dataInicio, setDataInicio] = useState(undefined);
  const [dataFim, setDataFim] = useState(undefined);

  const navigate = useNavigate();

  const {
    aberto: modalAberto,
    itemEditando: prazoEditando,
    itemParaExcluir: prazoParaExcluir,
    abrirNovo,
    abrirEdicao,
    fechar: fecharModal,
    confirmarExclusao,
    cancelarExclusao,
  } = useModal();

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErroLista("");
    try {
      const { data } = await listarPrazos({
        processo_id: processoIdFiltro ?? undefined,
        status: statusFiltro || undefined,
        tipo: tipoFiltro || undefined,
        data_inicio: toApiDate(dataInicio) || undefined,
        data_fim: toApiDate(dataFim) || undefined,
      });

      if (processoIdFiltro) {
        const res = await obterProcesso(processoIdFiltro);
        setProcessoTitulo(res.data.numero_processo);
      }

      setProcessos((await listarProcessos()).data);
      setPrazos(data);
    } catch {
      setErroLista("Não foi possível carregar os prazos.");
    } finally {
      setCarregando(false);
    }
  }, [processoIdFiltro, statusFiltro, tipoFiltro, dataInicio, dataFim]);

  useEffect(() => {
    const id = setTimeout(() => carregar(), 300);
    return () => clearTimeout(id);
  }, [carregar]);

  const handleSalvar = async (dados) => {
    if (prazoEditando) {
      await atualizarPrazo(prazoEditando.id, dados);
    } else {
      await criarPrazo(dados);
    }
    await carregar();
  };

  const handleExcluir = async () => {
    await deletarPrazo(prazoParaExcluir.id);
    cancelarExclusao();
    await carregar();
  };

  const temFiltroAtivo = statusFiltro || tipoFiltro || dataInicio || dataFim;

  const limparFiltros = () => {
    setStatusFiltro("");
    setTipoFiltro("");
    setDataInicio(undefined);
    setDataFim(undefined);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">
            Prazos{processoTitulo && ` — processo n. ${processoTitulo}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os prazos do escritório.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle tabela / calendário */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <Button
              variant={modoVisualizacao === "tabela" ? "secondary" : "ghost"}
              size="icon-sm"
              className="rounded-none border-0"
              onClick={() => setModoVisualizacao("tabela")}
              title="Visualizar em tabela"
            >
              <Table2 className="size-4" />
            </Button>
            <Button
              variant={modoVisualizacao === "calendario" ? "secondary" : "ghost"}
              size="icon-sm"
              className="rounded-none border-0 border-l border-border"
              onClick={() => setModoVisualizacao("calendario")}
              title="Visualizar em calendário"
            >
              <CalendarDays className="size-4" />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={prazos.length === 0}>
                <Download className="size-4" />
                Exportar
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => {
                    const cabecalhos = ["Processo n.", "Descrição", "Tipo", "Data/Prazo", "Status"];
                    const linhas = prazos.map((p) => {
                      const proc = processos.find((pr) => pr.id === p.processo_id);
                      return [
                        proc?.numero_processo || `#${p.processo_id}`,
                        p.descricao || "—",
                        p.tipo || "—",
                        new Date(p.data_prazo).toLocaleDateString("pt-BR"),
                        p.status || "—",
                      ];
                    });
                    exportarPDF(cabecalhos, linhas, "Prazos", "prazos");
                  }}
                >
                  <FileText className="size-4" />
                  Exportar PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    const cabecalhos = ["Processo n.", "Descrição", "Tipo", "Data/Prazo", "Status"];
                    const linhas = prazos.map((p) => {
                      const proc = processos.find((pr) => pr.id === p.processo_id);
                      return [
                        proc?.numero_processo || `#${p.processo_id}`,
                        p.descricao || "",
                        p.tipo || "",
                        new Date(p.data_prazo).toLocaleDateString("pt-BR"),
                        p.status || "",
                      ];
                    });
                    exportarExcel(cabecalhos, linhas, "prazos", "Prazos");
                  }}
                >
                  <Table2 className="size-4" />
                  Exportar Excel
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={abrirNovo}>
            <Plus />
            Novo prazo
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col gap-3">
        {/* Linha 1: tipo e status */}
        <div className="flex flex-wrap items-center gap-2">
          <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Tipo de prazo" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Tipo</SelectLabel>
                {TIPOS_PRAZO.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 flex-wrap">
            <DatePickerFiltro
              label="De"
              value={dataInicio}
              onChange={setDataInicio}
            />
            <DatePickerFiltro
              label="Até"
              value={dataFim}
              onChange={setDataFim}
            />
          </div>

          {temFiltroAtivo && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limparFiltros}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5 mr-1" />
              Limpar filtros
            </Button>
          )}
        </div>

        {/* Tags de filtros ativos */}
        {temFiltroAtivo && (
          <div className="flex flex-wrap gap-1.5">
            {tipoFiltro && (
              <Badge variant="secondary" className="gap-1">
                Tipo: {tipoFiltro}
                <button
                  onClick={() => setTipoFiltro("")}
                  className="ml-0.5 hover:opacity-70"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {statusFiltro && (
              <Badge variant="secondary" className="gap-1">
                Status: {statusFiltro}
                <button
                  onClick={() => setStatusFiltro("")}
                  className="ml-0.5 hover:opacity-70"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {dataInicio && (
              <Badge variant="secondary" className="gap-1">
                De: {format(dataInicio, "dd/MM/yyyy")}
                <button
                  onClick={() => setDataInicio(undefined)}
                  className="ml-0.5 hover:opacity-70"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
            {dataFim && (
              <Badge variant="secondary" className="gap-1">
                Até: {format(dataFim, "dd/MM/yyyy")}
                <button
                  onClick={() => setDataFim(undefined)}
                  className="ml-0.5 hover:opacity-70"
                >
                  <X className="size-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Calendário */}
      {modoVisualizacao === "calendario" && (
        <PrazosCalendario
          prazos={prazos}
          processos={processos}
          onEventClick={abrirEdicao}
        />
      )}

      {/* Tabela */}
      {modoVisualizacao === "tabela" && (
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Processo n.</th>
              <th className="text-left px-4 py-3 font-medium">Descrição</th>
              <th className="text-left px-4 py-3 font-medium">Tipo</th>
              <th className="text-left px-4 py-3 font-medium">Data / Prazo</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  <Loader2 className="animate-spin mx-auto size-5" />
                </td>
              </tr>
            )}

            {!carregando && erroLista && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-destructive"
                >
                  {erroLista}
                </td>
              </tr>
            )}

            {!carregando && !erroLista && prazos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UserX className="size-8" />
                    <span className="text-sm">
                      {temFiltroAtivo
                        ? "Nenhum prazo encontrado para os filtros aplicados."
                        : "Nenhum prazo cadastrado ainda."}
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {!carregando &&
              prazos.map((p) => {
                const proc = processos.find((pr) => pr.id === p.processo_id);
                return (
                  <tr
                    key={p.id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      <Button
                        variant="link"
                        className="h-auto p-0 font-medium"
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
                      <Badge variant={STATUS_CORES[p.status] ?? "outline"}>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
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
                );
              })}
          </tbody>
        </table>
      </div>
      )}

      {modoVisualizacao === "tabela" && prazos.length > 0 && !carregando && (
        <p className="text-xs text-muted-foreground">
          {prazos.length} {prazos.length === 1 ? "prazo" : "prazos"} encontrado
          {prazos.length === 1 ? "" : "s"}
        </p>
      )}

      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="cursor-pointer hover:underline w-24 mx-auto"
      >
        Voltar
      </Button>

      {/* Modais */}
      <ModalPrazo
        aberto={modalAberto}
        onFechar={fecharModal}
        prazoEditando={prazoEditando}
        onSalvar={handleSalvar}
      />

      <ModalConfirmarExclusao
        item={prazoParaExcluir}
        onConfirmar={handleExcluir}
        onCancelar={cancelarExclusao}
      />
    </div>
  );
}

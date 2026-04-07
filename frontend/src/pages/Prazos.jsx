import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState, useCallback } from "react";
import { useModal } from "@/hooks/useModal";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  UserX,
  CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { atualizarPrazo, criarPrazo, listarPrazos } from "@/api/prazos";
import { useNavigate, useSearchParams } from "react-router-dom";
import { listarProcessos, obterProcesso } from "@/api/processos";

const CAMPO_VAZIO = {
  processo_id: "",
  descricao: "",
  data_prazo: "",
  status: "",
  observacoes: "",
};

// Form para criação ou edição
function FormPrazo({ valores, onChange, erro }) {
  const [processos, setProcessos] = useState([]);
  useEffect(() => {
    const carregarProcessos = async () => {
      const { data } = await listarProcessos();
      setProcessos(data);
    };
    carregarProcessos();
  }, []);

  const campo = (id, label, placeholder, type = "text") => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {id === "processo_id" ? (
        <Select
          id={id}
          value={valores[id]}
          onValueChange={(v) => onChange(id, v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {processos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.numero_processo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : id === "status" ? (
        <Select
          id={id}
          value={valores[id]}
          onValueChange={(v) => onChange(id, v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={
            valores[id] && id === "data_prazo"
              ? valores[id].split("T")[0]
              : valores[id]
          }
          onChange={(e) => onChange(id, e.target.value)}
          aria-invalid={id === "processo_id" && !!erro}
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {erro && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {erro}
        </p>
      )}
      {campo("processo_id", "Processo ID *", "ID do Processo.")}
      {campo("descricao", "Descrição *", "Insira uma descrição.")}
      {campo("data_prazo", "Data do Prazo *", "Insira o prazo.", "date")}
      {campo("status", "Status", "Pendente, concluído ou cancelado.")}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          placeholder="Anotações internas sobre o prazo..."
          rows={3}
          value={valores.observacoes}
          onChange={(e) => onChange("observacoes", e.target.value)}
        />
      </div>
    </div>
  );
}

// Modal de criação ou edição
function ModalPrazo({ aberto, onFechar, prazoEditando, onSalvar }) {
  const [valores, setValores] = useState(CAMPO_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (aberto) {
      setValores(prazoEditando ?? CAMPO_VAZIO);
      setErro("");
    }
  }, [aberto, prazoEditando]);

  const handleChange = (campo, valor) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (
      campo === "processo_id" ||
      campo === "descricao" ||
      campo === "data_prazo" ||
      campo === "status"
    )
      setErro("");
  };

  const handleSalvar = async () => {
    if (
      !valores.processo_id ||
      !valores.descricao ||
      !valores.data_prazo ||
      !valores.status
    ) {
      setErro(
        'Os campos "processo_id", "descricao", "data_prazo" e "status" são obrigatórios.',
      );
      return;
    }

    setSalvando(true);
    setErro("");

    try {
      await onSalvar(valores);
      onFechar();
    } catch (error) {
      setErro(error.response?.data?.error || "Erro ao salvar prazo.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {prazoEditando ? "Editar prazo" : "Novo prazo"}
          </DialogTitle>
        </DialogHeader>
        <FormPrazo valores={valores} onChange={handleChange} erro={erro} />
        <DialogFooter>
          <Button variant="outline" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar} disabled={salvando}>
            {salvando && <Loader2 className="animate-spin" />}
            {salvando ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Modal de confirmação de exclusão
function ModalConfirmarExclusao({ prazo, onConfirmar, onCancelar }) {
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  const handleConfirmar = async () => {
    setExcluindo(true);
    setErro("");
    try {
      await onConfirmar();
    } catch (error) {
      setErro(error.response?.data?.error ?? "Erro ao excluir o prazo.");
      setExcluindo(false);
    }
  };

  return (
    <Dialog open={!!prazo} onOpenChange={(v) => !v && onCancelar()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Excluir prazo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">
              {prazo?.descricao}
            </span>
            ? Essa ação não pode ser desfeita.
          </p>
          {erro && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {erro}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancelar} disabled={excluindo}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirmar}
            disabled={excluindo}
          >
            {excluindo && <Loader2 className="animate-spin" />}
            {excluindo ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function toApiDate(date) {
  return date ? format(date, "yyyy-MM-dd") : "";
}

function DatePickerFiltro({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-muted-foreground">{label}</span>
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
    </div>
  );
}

// Página principal
export default function Prazos() {
  const [searchParams] = useSearchParams();
  const processoIdFiltro = searchParams.get("processo_id");

  const [prazos, setPrazos] = useState([]);
  const [busca, setBusca] = useState("");
  const [dataInicio, setDataInicio] = useState(undefined);
  const [dataFim, setDataFim] = useState(undefined);
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState("");
  const [processoTitulo, setProcessoTitulo] = useState("");
  const [processos, setProcessos] = useState([]);
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

  const carregar = useCallback(
    async (termosBusca = "", inicio = "", fim = "") => {
      setCarregando(true);
      setErroLista("");

      try {
        const { data } = await listarPrazos({
          processo_id: processoIdFiltro ?? undefined,
          status: termosBusca.trim() || undefined,
          data_inicio: inicio || undefined,
          data_fim: fim || undefined,
        });
        if (processoIdFiltro) {
          const res = await obterProcesso(processoIdFiltro);
          setProcessoTitulo(res.data.numero_processo);
        }
        setProcessos((await listarProcessos()).data);

        setPrazos(data);
      } catch (error) {
        setErroLista("Não foi possível carregar os prazos.");
      } finally {
        setCarregando(false);
      }
    },
    [processoIdFiltro],
  );

  useEffect(() => {
    const id = setTimeout(
      () => carregar(busca, toApiDate(dataInicio), toApiDate(dataFim)),
      300,
    );
    return () => clearTimeout(id);
  }, [busca, dataInicio, dataFim, carregar]);

  const handleSalvar = async (dados) => {
    if (prazoEditando) {
      await atualizarPrazo(prazoEditando.id, dados);
    } else {
      await criarPrazo(dados);
    }
    await carregar(busca, toApiDate(dataInicio), toApiDate(dataFim));
  };

  const handleExcluir = async () => {
    await deletarPrazo(prazoParaExcluir.id);
    cancelarExclusao();
    await carregar(busca, toApiDate(dataInicio), toApiDate(dataFim));
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">
            Prazos {processoTitulo && ` - processo n. ${processoTitulo}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os prazos do escritório.
          </p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus />
          Novo prazo
        </Button>
      </div>
      {/* Busca e filtros */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por ID do processo e/ou status..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <DatePickerFiltro
            label="De"
            value={dataInicio}
            onChange={setDataInicio}
          />
          <DatePickerFiltro label="Até" value={dataFim} onChange={setDataFim} />
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Processo n.</th>
              <th className="text-left px-4 py-3 font-medium">Descrição</th>
              <th className="text-left px-4 py-3 font-medium">Data/Prazo</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  <Loader2 className="animate-spin mx-auto size-5" />
                </td>
              </tr>
            )}

            {carregando && erroLista && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-destructive"
                >
                  {erroLista}
                </td>
              </tr>
            )}
            {!carregando && !erroLista && prazos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UserX className="size-8" />
                    <span className="text-sm">
                      {busca
                        ? "Nenhum prazo encontrado para essa busca."
                        : "Nenhum prazo cadastrado ainda."}
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {!carregando &&
              prazos.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    <Button
                      onClick={() => navigate(`/processos/${p.id}`)}
                      variant="link"
                    >
                      {processos.find((proc) => proc.id === p.processo_id)
                        ?.numero_processo || "Processo não encontrado"}
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.descricao}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(p.data_prazo).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.status}
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
              ))}
          </tbody>
        </table>
      </div>

      {prazos.length > 0 && !carregando && (
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
        prazo={prazoParaExcluir}
        onConfirmar={handleExcluir}
        onCancelar={cancelarExclusao}
      />
    </div>
  );
}

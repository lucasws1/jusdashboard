import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState, useCallback } from "react";
import { useModal } from "@/hooks/useModal";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  UserX,
  ChevronDown,
  SquareArrowOutUpRight,
  LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  atualizarProcesso,
  deletarProcesso,
  listarProcessos,
} from "@/api/processos";
import { obterCliente } from "@/api/clientes";
import { listarPrazos } from "@/api/prazos";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CAMPO_VAZIO = {
  cliente_id: "",
  numero_processo: "",
  titulo: "",
  area: "",
  tipo: "",
  vara_tribunal: "",
  status: "",
  observacoes: "",
};

// Form para criação ou edição
function FormProcesso({ valores, onChange, erro, clientes }) {
  const campo = (id, label, placeholder, type = "text") => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {id === "status" ? (
        <Select
          id={id}
          value={valores[id]}
          onValueChange={(v) => onChange(id, v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="suspenso">Suspenso</SelectItem>
            <SelectItem value="arquivado">Arquivado</SelectItem>
            <SelectItem value="encerrado">Encerrado</SelectItem>
          </SelectContent>
        </Select>
      ) : id === "cliente_id" ? (
        <Select
          id={id}
          value={valores[id]}
          onValueChange={(v) => onChange(id, v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={valores[id]}
          onChange={(e) => onChange(id, e.target.value)}
          aria-invalid={id === "cliente_id" && !!erro}
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
      {campo("cliente_id", "Cliente ID *", "ID do Cliente")}
      {campo(
        "numero_processo",
        "Número do Processo",
        "0000000-00.0000.0.00.0000",
      )}
      {campo("titulo", "Título *", "Ex.: Ação Trabalhista Nutrella")}
      {campo("area", "Área", "Ex.: Cível")}
      {campo("tipo", "Tipo", "Ex.: Execução")}
      {campo("vara_tribunal", "Vara / Tribunal", "Ex.: 10a Vara do Trabalho")}
      {campo("status", "Status", "Ativo, suspenso, arquivado, encerrado")}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          placeholder="Anotações internas sobre o cliente..."
          rows={3}
          value={valores.observacoes}
          onChange={(e) => onChange("observacoes", e.target.value)}
        />
      </div>
    </div>
  );
}

// Modal de criação ou edição
function ModalProcesso({
  aberto,
  onFechar,
  processoEditando,
  onSalvar,
  clientes,
}) {
  const [valores, setValores] = useState(CAMPO_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (aberto) {
      setValores(processoEditando ?? CAMPO_VAZIO);
      setErro("");
    }
  }, [aberto, processoEditando]);

  const handleChange = (campo, valor) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (campo === "cliente_id") setErro("");
    else if (campo === "titulo") setErro("");
  };

  const handleSalvar = async () => {
    if (!String(valores.cliente_id ?? "").trim()) {
      setErro('O campo "cliente_id" é obrigatório.');
      return;
    } else if (!valores.titulo.trim()) {
      setErro('O campo "titulo" é obrigatório.');
      return;
    }

    setSalvando(true);
    setErro("");

    try {
      await onSalvar(valores);
      onFechar();
    } catch (error) {
      setErro(error.response?.data?.error || "Erro ao salvar processo.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {processoEditando ? "Editar processo" : "Novo processo"}
          </DialogTitle>
        </DialogHeader>
        <FormProcesso
          valores={valores}
          onChange={handleChange}
          erro={erro}
          clientes={clientes}
        />
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

// Modal de confirmação da exclusão
function ModalConfirmarExclusao({ processo, onConfirmar, onCancelar }) {
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  const handleConfirmar = async () => {
    setExcluindo(true);
    setErro("");
    try {
      await onConfirmar();
    } catch (error) {
      setErro(error.response?.data?.error ?? "Erro ao excluir processo.");
      setExcluindo(false);
    }
  };

  return (
    <Dialog open={!!processo} onOpenChange={(v) => !v && onCancelar()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Excluir processo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">
              {processo?.titulo}
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

// Página principal
export default function Processos() {
  const [processos, setProcessos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState("");

  const [searchParams] = useSearchParams();
  const clienteIdFiltro = searchParams.get("cliente_id");
  const [statusFiltro, setStatusFiltro] = useState("");

  const navigate = useNavigate();

  const {
    aberto: modalAberto,
    itemEditando: processoEditando,
    itemParaExcluir: processoParaExcluir,
    abrirNovo,
    abrirEdicao,
    fechar: fecharModal,
    confirmarExclusao,
    cancelarExclusao,
  } = useModal();

  const carregar = useCallback(
    async (busca) => {
      setCarregando(true);
      setErroLista("");
      try {
        const { data } = await listarProcessos({
          cliente_id: clienteIdFiltro ?? undefined,
          status: statusFiltro || undefined,
          busca: busca || undefined,
        });
        setProcessos(data);
        const idsUnicos = [...new Set(data.map((p) => p.cliente_id))];
        const res = await Promise.all(idsUnicos.map((id) => obterCliente(id)));
        setClientes(res.map((c) => c.data));
      } catch (error) {
        setErroLista("Não foi possível carregar os processos.");
      } finally {
        setCarregando(false);
      }
    },
    [clienteIdFiltro, statusFiltro],
  );

  useEffect(() => {
    const id = setTimeout(() => carregar(busca), 300);
    return () => clearTimeout(id);
  }, [carregar, busca, statusFiltro]);

  const handleSalvar = async (dados) => {
    if (processoEditando) {
      await atualizarProcesso(processoEditando.id, dados);
    } else {
      await criarProcesso(dados);
    }
    await carregar();
  };

  const handleExcluir = async () => {
    await deletarProcesso(processoParaExcluir.id);
    cancelarExclusao();
    await carregar();
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Processos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os processos do escritório.
          </p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus />
          Novo Processo
        </Button>
      </div>
      {/* Busca */}
      <div className="relative flex items-center gap-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por ID do cliente e/ou status do processo"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <div>
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem>Todos</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="suspenso">Suspenso</SelectItem>
              <SelectItem value="arquivado">Arquivado</SelectItem>
              <SelectItem value="encerrado">Encerrado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Cliente</th>
              <th className="text-left px-4 py-3 font-medium">Número</th>
              <th className="text-left px-4 py-3 font-medium">Título</th>
              <th className="text-left px-4 py-3 font-medium">Área</th>
              <th className="text-left px-4 py-3 font-medium">Tipo</th>
              <th className="text-left px-4 py-3 font-medium">Vara/Tribunal</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {carregando && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  <Loader2 className="animate-spin mx-auto size-5" />
                </td>
              </tr>
            )}

            {carregando && erroLista && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-destructive"
                >
                  {erroLista}
                </td>
              </tr>
            )}
            {!carregando && !erroLista && processos.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UserX className="size-8" />
                    <span className="text-sm">
                      {busca
                        ? "Nenhum processo encontrado para essa busca."
                        : "Nenhum processo cadastrado ainda."}
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {!carregando &&
              processos.map((p) => (
                <tr
                  key={p.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    {clientes.find((c) => c.id === p.cliente_id)?.nome ||
                      p.cliente_id}
                  </td>
                  <td className="px-4 py-3 flex items-center text-muted-foreground">
                    <Link
                      className="flex hover:underline"
                      to={`/processos/${p.id}`}
                    >
                      {p.numero_processo} <LinkIcon className="size-4" />
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.titulo}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.area}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.tipo}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.vara_tribunal}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.status}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => abrirEdicao(p)}
                        title="Editar"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmarExclusao(p)}
                        title="Excluir"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronDown className="size-5 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuGroup>
                            <DropdownMenuItem
                              onClick={() => navigate(`/processos/${p.id}`)}
                            >
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                navigate(`/prazos?processo_id=${p.id}`);
                              }}
                            >
                              Ver Prazos
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                navigate(`/andamentos?processo_id=${p.id}`);
                              }}
                            >
                              Ver Andamentos
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {processos.length > 0 && !carregando && (
        <p className="text-xs text-muted-foreground">
          {processos.length} {processos.length === 1 ? "processo" : "processos"}
          encontrado{processos.length === 1 ? "" : "s"}
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
      <ModalProcesso
        aberto={modalAberto}
        onFechar={fecharModal}
        processoEditando={processoEditando}
        onSalvar={handleSalvar}
        clientes={clientes}
      />

      <ModalConfirmarExclusao
        processo={processoParaExcluir}
        onConfirmar={handleExcluir}
        onCancelar={cancelarExclusao}
      />
    </div>
  );
}

import { useEffect, useState, useCallback } from "react";
import { useModal } from "@/hooks/useModal";
import { Search, Plus, Pencil, Trash2, Loader2, UserX } from "lucide-react";
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
  atualizarAndamento,
  criarAndamento,
  deletarAndamento,
  listarAndamentos,
} from "@/api/andamentos";
import { useNavigate, useSearchParams } from "react-router-dom";
import { obterProcesso } from "@/api/processos";

const CAMPO_VAZIO = {
  processo_id: "",
  data_andamento: "",
  descricao: "",
  tipo: "",
};

// Formulário modal criação e edição
function FormAndamento({ valores, onChange, erro }) {
  const campo = (id, label, placeholder, type = "text") => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={valores[id]}
        onChange={(e) => onChange(id, e.target.value)}
        aria-invalid={
          id === "processo_id" || id === "data_andamento" || id === "descricao"
            ? !!erro
            : false
        }
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {erro && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {erro}
        </p>
      )}
      {campo("processo_id", "Processo ID *", "Selecione o processo")}
      {campo(
        "data_andamento",
        "Data do Andamento *",
        "Insira a data do andamento",
        "date",
      )}
      {campo("descricao", "Descrição *", "Descreva o andamento", "textarea")}
      {campo("tipo", "Tipo", "Insira o tipo do andamento")}
    </div>
  );
}

// Modal de criação e edição
function ModalAndamento({ aberto, onFechar, andamentoEditando, onSalvar }) {
  const [valores, setValores] = useState(CAMPO_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (aberto) {
      setValores(andamentoEditando ?? CAMPO_VAZIO);
      setErro("");
    }
  }, [aberto, andamentoEditando]);

  const handleChange = (campo, valor) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (
      campo === "processo_id" ||
      campo === "descricao" ||
      campo === "data_andamento"
    )
      setErro("");
  };

  const handleSalvar = async () => {
    if (
      !valores.processo_id ||
      !valores.data_andamento.trim() ||
      !valores.descricao.trim()
    ) {
      setErro("Preencha os campos obrigatórios.");
      return;
    }

    setSalvando(true);
    setErro("");
    try {
      await onSalvar(valores);
      onFechar();
    } catch (error) {
      setErro(
        error.response?.data?.error || "Ocorreu um erro ao salvar o andamento.",
      );
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {andamentoEditando ? "Editar Andamento" : "Novo Andamento"}
          </DialogTitle>
        </DialogHeader>
        <FormAndamento valores={valores} onChange={handleChange} erro={erro} />
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
function ModalConfirmarExclusao({ andamento, onConfirmar, onCancelar }) {
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  const handleConfirmar = async () => {
    setExcluindo(true);
    setErro("");
    try {
      await onConfirmar();
    } catch (error) {
      setErro(
        error.response?.data?.error ??
          "Ocorreu um erro ao excluir o andamento.",
      );
      setExcluindo(false);
    }
  };

  return (
    <Dialog open={!!andamento} onOpenChange={(v) => !v && onCancelar()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Excluir Cliente</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">
              {andamento?.descricao}
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

// Página principal de andamentos
export default function Andamentos() {
  const [searchParams] = useSearchParams();
  const processoIdFiltro = searchParams.get("processo_id") || "";
  const [processoNumero, setProcessoNumero] = useState("");

  const [andamentos, setAndamentos] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erroLista, setErroLista] = useState("");

  const navigate = useNavigate();

  const {
    aberto: modalAberto,
    itemEditando: andamentoEditando,
    itemParaExcluir: andamentoParaExcluir,
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
      const { data } = await listarAndamentos({
        processo_id: processoIdFiltro,
      });
      setAndamentos(data);

      const res = await obterProcesso(processoIdFiltro);
      setProcessoNumero(res.data.numero_processo);
    } catch (error) {
      setErroLista("Ocorreu um erro ao carregar os andamentos.");
    } finally {
      setCarregando(false);
    }
  }, [processoIdFiltro]);

  useEffect(() => {
    const id = setTimeout(() => carregar(), 300);
    return () => clearTimeout(id);
  }, [busca, carregar]);

  const handleSalvar = async (dados) => {
    if (andamentoEditando) {
      await atualizarAndamento(andamentoEditando.id, dados);
    } else {
      await criarAndamento(dados);
    }
    await carregar(busca);
  };

  const handleExcluir = async () => {
    await deletarAndamento(andamentoParaExcluir.id);
    cancelarExclusao();
    await carregar(busca);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto w-full">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">
            Andamentos {processoNumero && `do processo: ${processoNumero}`}
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os andamentos dos processos.
          </p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus /> Novo Andamento
        </Button>
      </div>
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar andamentos..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Tabela */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Processo ID</th>
              <th className="px-4 py-2 text-left font-medium">Data</th>
              <th className="px-4 py-2 text-left font-medium">Tipo</th>
              <th className="text-left px-4 py-3 font-medium">Descrição</th>
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

            {!carregando && erroLista && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-destructive"
                >
                  {erroLista}
                </td>
              </tr>
            )}
            {!carregando && !erroLista && andamentos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UserX className="size-8" />
                    <span className="text-sm">
                      {busca
                        ? "Nenhum andamento encontrado para sua busca."
                        : "Nenhum andamento cadastrado."}
                    </span>
                  </div>
                </td>
              </tr>
            )}

            {!carregando &&
              andamentos.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{a.processo_id}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.data_andamento
                      ? new Date(a.data_andamento).toLocaleDateString("pt-br")
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.tipo || "-"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {a.descricao || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => abrirEdicao(a)}
                        title="Editar"
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => confirmarExclusao(a)}
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
      {andamentos.length > 0 && !carregando && (
        <p className="text-xs text-muted-foreground">
          {andamentos.length}{" "}
          {andamentos.length === 1 ? "andamento" : "andamentos"} encontrado
          {andamentos.length === 1 ? "" : "s"}
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
      <ModalAndamento
        aberto={modalAberto}
        onFechar={fecharModal}
        andamentoEditando={andamentoEditando}
        onSalvar={handleSalvar}
      />

      <ModalConfirmarExclusao
        andamento={andamentoParaExcluir}
        onConfirmar={handleExcluir}
        onCancelar={cancelarExclusao}
      />
    </div>
  );
}

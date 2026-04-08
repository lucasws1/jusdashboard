import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import FormAndamento from "./FormAndamento";

const CAMPO_VAZIO = {
  processo_id: "",
  data_andamento: "",
  descricao: "",
  tipo: "",
};

export default function ModalAndamento({
  aberto,
  onFechar,
  andamentoEditando,
  onSalvar,
}) {
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

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import FormPrazo from "./FormPrazo";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

const CAMPO_VAZIO = {
  processo_id: "",
  descricao: "",
  tipo: "",
  data_prazo: "",
  status: "pendente",
  observacoes: "",
};

export default function ModalPrazo({
  aberto,
  onFechar,
  prazoEditando,
  onSalvar,
  ocultarProcessoId = false,
}) {
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
    setErro("");
  };

  const handleSalvar = async () => {
    if (!ocultarProcessoId && !valores.processo_id) {
      setErro('O campo "processo" é obrigatório.');
      return;
    }
    if (!valores.descricao?.trim()) {
      setErro('O campo "descrição" é obrigatório.');
      return;
    }
    if (!valores.data_prazo) {
      setErro('O campo "data do prazo" é obrigatório.');
      return;
    }
    if (!valores.status) {
      setErro('O campo "status" é obrigatório.');
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
        <FormPrazo
          valores={valores}
          onChange={handleChange}
          erro={erro}
          ocultarProcessoId={ocultarProcessoId}
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

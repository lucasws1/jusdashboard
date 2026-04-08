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

const CAMPO_VAZIO = {
  processo_id: "",
  descricao: "",
  data_prazo: "",
  status: "",
  observacoes: "",
};

export default function ModalPrazo({
  aberto,
  onFechar,
  prazoEditando,
  onSalvar,
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

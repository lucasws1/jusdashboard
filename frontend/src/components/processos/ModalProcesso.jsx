import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import FormProcesso from "./FormProcesso";

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

export default function ModalProcesso({
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

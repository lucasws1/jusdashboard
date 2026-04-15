import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import FormLancamento from "./FormLancamento";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const CAMPO_VAZIO = {
  tipo: "",
  descricao: "",
  valor: "",
  data_vencimento: "",
  data_pagamento: "",
};

export default function ModalLancamento({
  aberto,
  onFechar,
  lancamentoEditando,
  onSalvar,
}) {
  const [valores, setValores] = useState(CAMPO_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (aberto) {
      setValores(lancamentoEditando ?? CAMPO_VAZIO);
      setErro("");
    }
  }, [aberto, lancamentoEditando]);

  const handleChange = (campo, valor) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    setErro("");
  };

  const handleSalvar = async () => {
    if (!valores.tipo) {
      setErro('O campo "tipo" é obrigatório.');
      return;
    }
    if (!valores.descricao?.trim()) {
      setErro('O campo "descrição" é obrigatório.');
      return;
    }
    if (valores.valor === "" || valores.valor === null || valores.valor === undefined) {
      setErro('O campo "valor" é obrigatório.');
      return;
    }
    if (isNaN(Number(valores.valor)) || Number(valores.valor) < 0) {
      setErro('"Valor" deve ser um número positivo.');
      return;
    }

    setSalvando(true);
    setErro("");

    try {
      await onSalvar(valores);
      onFechar();
    } catch (error) {
      setErro(error.response?.data?.error || "Erro ao salvar lançamento.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {lancamentoEditando ? "Editar lançamento" : "Novo lançamento"}
          </DialogTitle>
        </DialogHeader>
        <FormLancamento valores={valores} onChange={handleChange} erro={erro} />
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

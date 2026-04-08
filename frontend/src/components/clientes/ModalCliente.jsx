import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import FormCliente from "./FormCliente";

const CAMPO_VAZIO = {
  nome: "",
  cpf_cnpj: "",
  email: "",
  telefone: "",
  endereco: "",
  observacoes: "",
};

export default function ModalCliente({
  aberto,
  onFechar,
  clienteEditando,
  onSalvar,
}) {
  const [valores, setValores] = useState(CAMPO_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (aberto) {
      setValores(clienteEditando ?? CAMPO_VAZIO);
      setErro("");
    }
  }, [aberto, clienteEditando]);

  const handleChange = (campo, valor) => {
    setValores((v) => ({ ...v, [campo]: valor }));
    if (campo === "nome") setErro("");
  };

  const handleSalvar = async () => {
    if (!valores.nome.trim()) {
      setErro("O campo nome é obrigatório.");
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      await onSalvar(valores);
      onFechar();
    } catch (e) {
      setErro(e.response?.data?.error ?? "Erro ao salvar cliente.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {clienteEditando ? "Editar cliente" : "Novo cliente"}
          </DialogTitle>
        </DialogHeader>
        <FormCliente valores={valores} onChange={handleChange} erro={erro} />
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

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

export function useModal() {
  const [aberto, setAberto] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);
  const [itemParaExcluir, setItemParaExcluir] = useState(null);

  return {
    aberto,
    itemEditando,
    itemParaExcluir,
    abrirNovo: () => {
      setItemEditando(null);
      setAberto(true);
    },
    abrirEdicao: (item) => {
      setItemEditando(item);
      setAberto(true);
    },
    fechar: () => setAberto(false),
    confirmarExclusao: (item) => setItemParaExcluir(item),
    cancelarExclusao: () => setItemParaExcluir(null),
  };
}

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "../ui/button";

export default function ModalConfirmarExclusao({
  item,
  onConfirmar,
  onCancelar,
}) {
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState("");

  const handleConfirmar = async () => {
    setExcluindo(true);
    setErro("");
    try {
      await onConfirmar();
    } catch (error) {
      setErro(error.response?.data?.error ?? "Erro ao excluir item.");
      setExcluindo(false);
    }
  };

  return (
    <Dialog open={!!item} onOpenChange={(v) => !v && onCancelar()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Excluir item</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-foreground">{item?.titulo}</span>?
            Essa ação não pode ser desfeita.
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

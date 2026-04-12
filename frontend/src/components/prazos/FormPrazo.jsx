import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { listarProcessos } from "@/api/processos";

const TIPOS_PRAZO = [
  "audiência",
  "recurso",
  "contrarrazões",
  "laudo pericial",
  "manifestação",
  "contestação",
  "embargos",
  "petição",
  "outros",
];

export default function FormPrazo({
  valores,
  onChange,
  erro,
  ocultarProcessoId = false,
}) {
  const [processos, setProcessos] = useState([]);

  useEffect(() => {
    const carregarProcessos = async () => {
      const { data } = await listarProcessos();
      setProcessos(data);
    };
    carregarProcessos();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {erro && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {erro}
        </p>
      )}

      {/* Processo - oculto quando o contexto já fornece o processo_id */}
      {!ocultarProcessoId && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="processo_id">Processo *</Label>
          <Select
            value={String(valores.processo_id ?? "")}
            onValueChange={(v) => onChange("processo_id", Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o processo" />
            </SelectTrigger>
            <SelectContent>
              {processos.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.numero_processo || `Processo #${p.id}`} - {p.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Descrição */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="descricao">Descrição *</Label>
        <Input
          id="descricao"
          placeholder="Ex.: Apresentar contrarrazões ao recurso do réu"
          value={valores.descricao ?? ""}
          onChange={(e) => onChange("descricao", e.target.value)}
        />
      </div>

      {/* Tipo */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tipo">Tipo</Label>
        <Select
          value={valores.tipo ?? ""}
          onValueChange={(v) => onChange("tipo", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo de prazo" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Tipo de prazo</SelectLabel>
              {TIPOS_PRAZO.map((t) => (
                <SelectItem key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Data do prazo */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="data_prazo">Data do prazo *</Label>
        <Input
          id="data_prazo"
          type="date"
          value={valores.data_prazo ? valores.data_prazo.split("T")[0] : ""}
          onChange={(e) => onChange(data_prazo, e.target.value)}
        />
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="status">Status *</Label>
        <Select
          value={valores.status ?? "pendente"}
          onValueChange={(v) => onChange("status", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectGroup>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="concluido">Concluido</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectGroup>
        </Select>
      </div>

      {/* Observações */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          placeholder="Anotações internas sobre o prazo..."
          rows={3}
          value={valores.observacoes ?? ""}
          onChange={(e) => onChange("observacoes", e.target.value)}
        />
      </div>
    </div>
  );
}

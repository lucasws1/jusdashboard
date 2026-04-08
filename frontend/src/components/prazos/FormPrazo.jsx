import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { useEffect, useState } from "react";
import { listarProcessos } from "@/api/processos";

export default function FormPrazo({ valores, onChange, erro }) {
  const [processos, setProcessos] = useState([]);
  useEffect(() => {
    const carregarProcessos = async () => {
      const { data } = await listarProcessos();
      setProcessos(data);
    };
    carregarProcessos();
  }, []);

  const campo = (id, label, placeholder, type = "text") => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {id === "processo_id" ? (
        <Select
          id={id}
          value={valores[id]}
          onValueChange={(v) => onChange(id, v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {processos.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.numero_processo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : id === "status" ? (
        <Select
          id={id}
          value={valores[id]}
          onValueChange={(v) => onChange(id, v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="concluido">Concluído</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={
            valores[id] && id === "data_prazo"
              ? valores[id].split("T")[0]
              : valores[id]
          }
          onChange={(e) => onChange(id, e.target.value)}
          aria-invalid={id === "processo_id" && !!erro}
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {erro && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {erro}
        </p>
      )}
      {campo("processo_id", "Processo ID *", "ID do Processo.")}
      {campo("descricao", "Descrição *", "Insira uma descrição.")}
      {campo("data_prazo", "Data do Prazo *", "Insira o prazo.", "date")}
      {campo("status", "Status", "Pendente, concluído ou cancelado.")}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          placeholder="Anotações internas sobre o prazo..."
          rows={3}
          value={valores.observacoes}
          onChange={(e) => onChange("observacoes", e.target.value)}
        />
      </div>
    </div>
  );
}

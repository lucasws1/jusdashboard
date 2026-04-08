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

export default function FormProcesso({ valores, onChange, erro, clientes }) {
  const campo = (id, label, placeholder, type = "text") => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {id === "status" ? (
        <Select
          id={id}
          value={valores[id]}
          onValueChange={(v) => onChange(id, v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="suspenso">Suspenso</SelectItem>
            <SelectItem value="arquivado">Arquivado</SelectItem>
            <SelectItem value="encerrado">Encerrado</SelectItem>
          </SelectContent>
        </Select>
      ) : id === "cliente_id" ? (
        <Select
          id={id}
          value={valores[id]}
          onValueChange={(v) => onChange(id, v)}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {clientes.map((cliente) => (
              <SelectItem key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={valores[id]}
          onChange={(e) => onChange(id, e.target.value)}
          aria-invalid={id === "cliente_id" && !!erro}
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
      {campo("cliente_id", "Cliente ID *", "ID do Cliente")}
      {campo(
        "numero_processo",
        "Número do Processo",
        "0000000-00.0000.0.00.0000",
      )}
      {campo("titulo", "Título *", "Ex.: Ação Trabalhista Nutrella")}
      {campo("area", "Área", "Ex.: Cível")}
      {campo("tipo", "Tipo", "Ex.: Execução")}
      {campo("vara_tribunal", "Vara / Tribunal", "Ex.: 10a Vara do Trabalho")}
      {campo("status", "Status", "Ativo, suspenso, arquivado, encerrado")}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          placeholder="Anotações internas sobre o cliente..."
          rows={3}
          value={valores.observacoes}
          onChange={(e) => onChange("observacoes", e.target.value)}
        />
      </div>
    </div>
  );
}

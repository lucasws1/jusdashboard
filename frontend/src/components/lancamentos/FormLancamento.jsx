import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const TIPOS_LANCAMENTO = [
  { value: "honorario", label: "Honorário" },
  { value: "custa", label: "Custa" },
  { value: "deposito", label: "Depósito judicial" },
  { value: "reembolso", label: "Reembolso" },
  { value: "outro", label: "Outro" },
];

export default function FormLancamento({ valores, onChange, erro }) {
  return (
    <div className="flex flex-col gap-4">
      {erro && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {erro}
        </p>
      )}

      {/* Tipo */}
      <div className="flex flex-col gap-1.5">
        <Label>Tipo *</Label>
        <Select
          value={valores.tipo ?? ""}
          onValueChange={(v) => onChange("tipo", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Tipo de lançamento</SelectLabel>
              {TIPOS_LANCAMENTO.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Descrição */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="descricao">Descrição *</Label>
        <Input
          id="descricao"
          placeholder="Ex.: Honorários iniciais — contrato de serviços"
          value={valores.descricao ?? ""}
          onChange={(e) => onChange("descricao", e.target.value)}
        />
      </div>

      {/* Valor */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="valor">Valor (R$) *</Label>
        <Input
          id="valor"
          type="number"
          min="0"
          step="0.01"
          placeholder="0,00"
          value={valores.valor ?? ""}
          onChange={(e) => onChange("valor", e.target.value)}
        />
      </div>

      {/* Datas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="data_vencimento">Vencimento</Label>
          <Input
            id="data_vencimento"
            type="date"
            value={
              valores.data_vencimento
                ? valores.data_vencimento.split("T")[0]
                : ""
            }
            onChange={(e) => onChange("data_vencimento", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="data_pagamento">
            Data de pagamento
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              (deixe vazio = pendente)
            </span>
          </Label>
          <Input
            id="data_pagamento"
            type="date"
            value={
              valores.data_pagamento
                ? valores.data_pagamento.split("T")[0]
                : ""
            }
            onChange={(e) => onChange("data_pagamento", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

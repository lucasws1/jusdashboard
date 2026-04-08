import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

export default function FormCliente({ valores, onChange, erro }) {
  const campo = (id, label, placeholder, type = "text") => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={valores[id]}
        onChange={(e) => onChange(id, e.target.value)}
        aria-invalid={id === "nome" && !!erro}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {erro && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {erro}
        </p>
      )}
      {campo("nome", "Nome *", "Nome completo ou razão social")}
      {campo("cpf_cnpj", "CPF / CNPJ", "000.000.000-00 ou 00.000.000/0001-00")}
      {campo("email", "E-mail", "email@exemplo.com", "email")}
      {campo("telefone", "Telefone", "(11) 99999-9999", "tel")}
      {campo("endereco", "Endereço", "Rua, número, cidade")}
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

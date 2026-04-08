import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function FormAndamento({ valores, onChange, erro }) {
  const campo = (id, label, placeholder, type = "text") => (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={valores[id]}
        onChange={(e) => onChange(id, e.target.value)}
        aria-invalid={
          id === "processo_id" || id === "data_andamento" || id === "descricao"
            ? !!erro
            : false
        }
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
      {campo("processo_id", "Processo ID *", "Selecione o processo")}
      {campo(
        "data_andamento",
        "Data do Andamento *",
        "Insira a data do andamento",
        "date",
      )}
      {campo("descricao", "Descrição *", "Descreva o andamento", "textarea")}
      {campo("tipo", "Tipo", "Insira o tipo do andamento")}
    </div>
  );
}

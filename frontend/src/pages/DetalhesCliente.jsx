import { obterCliente } from "@/api/clientes";
import { listarProcessos, obterProcesso } from "@/api/processos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

function formatarData(data) {
  return new Date(data).toLocaleDateString("pt-BR");
}

export default function DetalhesCliente() {
  const [processos, setProcessos] = useState(null);
  const [cliente, setCliente] = useState(null);
  const navigate = useNavigate();

  const { id } = useParams();

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const responseProcesso = await listarProcessos({ cliente_id: id });
        const responseCliente = await obterCliente(id);
        setCliente(responseCliente.data);
        setProcessos(responseProcesso.data);
      } catch (error) {
        console.error("Erro ao obter processo:", error);
      }
    };
    carregarDados();
  }, [id]);

  return (
    <div>
      <Card className="w-full max-w-sm mx-auto mt-10">
        <CardHeader>
          <CardTitle>{cliente?.nome || "Carregando..."}</CardTitle>
          <CardAction>
            <Badge>Processos: {processos?.length || "Carregando..."}</Badge>
          </CardAction>
          <CardDescription>
            <Badge variant="outline">Detalhes do cliente</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Item>
            <ItemContent>
              <ItemTitle>{cliente?.nome || "Carregando..."}</ItemTitle>
              <ItemDescription>
                {processos?.[0]?.titulo || "Carregando..."}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge>{processos?.[0]?.status}</Badge>
            </ItemActions>
          </Item>
          <div className="flex flex-col gap-2">
            <p className="font-medium">
              {processos?.[0]?.vara_tribunal || "Carregando..."}
            </p>

            <p className="">
              Observações: {processos?.[0]?.observacoes || "Carregando..."}
            </p>
            <div className="flex gap-4">
              <p className="text-sm text-muted-foreground">
                Criado:{" "}
                {formatarData(processos?.[0]?.created_at) || "Carregando..."}
              </p>
              <p className="text-sm text-muted-foreground">
                Atualizado:{" "}
                {formatarData(processos?.[0]?.updated_at) || "Carregando..."}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex items-center justify-center w-full mx-auto gap-4">
          <Button
            onClick={() => {
              navigate(`/prazos?processo_id=${processos?.[0]?.id}`);
            }}
            variant="outline"
          >
            Prazos
          </Button>
          <Button
            onClick={() => {
              navigate(`/andamentos?processo_id=${processos?.[0]?.id}`);
            }}
            variant="outline"
          >
            Andamentos
          </Button>
          <Button
            variant="outline"
            className="cursor-pointer  hover:underline"
            onClick={() => navigate(-1)}
          >
            Voltar
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

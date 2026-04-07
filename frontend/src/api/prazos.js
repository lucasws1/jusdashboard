import api from "./axios";

export const listarPrazos = (busca) => {
  const { processo_id, status, data_inicio, data_fim } = busca;
  const params = {};

  if (processo_id) params.processo_id = processo_id;
  if (status) params.status = status;
  if (data_inicio) params.data_inicio = data_inicio;
  if (data_fim) params.data_fim = data_fim;

  return api.get("/prazos", { params });
};

export const criarPrazo = (dados) => api.post("/prazos", dados);

export const atualizarPrazo = (id, dados) => api.put(`/prazos/${id}`, dados);

export const deletarPrazo = (id) => api.delete(`/prazos/${id}`);

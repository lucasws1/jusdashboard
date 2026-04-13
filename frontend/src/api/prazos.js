import api from "./axios";

export const listarPrazos = (filtros = {}) => {
  const { processo_id, status, tipo, busca, data_inicio, data_fim } = filtros;
  const params = {};

  if (processo_id) params.processo_id = processo_id;
  if (status) params.status = status;
  if (tipo) params.tipo = tipo;
  if (busca) params.busca = busca;
  if (data_inicio) params.data_inicio = data_inicio;
  if (data_fim) params.data_fim = data_fim;

  return api.get("/prazos", { params });
};

export const criarPrazo = (dados) => api.post("/prazos", dados);

export const atualizarPrazo = (id, dados) => api.put(`/prazos/${id}`, dados);

export const deletarPrazo = (id) => api.delete(`/prazos/${id}`);

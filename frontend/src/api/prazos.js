import api from "./axios";

export const listarPrazos = (busca) => {
  const { processo_id, status } = busca;
  const params = {};

  if (processo_id) params.processo_id = processo_id;
  if (status) params.status = status;

  return api.get("/prazos", { params });
};

export const criarPrazo = (dados) => api.post("/prazos", dados);

export const atualizarPrazo = (id, dados) => api.put(`/prazos/${id}`, dados);

export const deletarPrazo = (id) => api.delete(`/prazos/${id}`);

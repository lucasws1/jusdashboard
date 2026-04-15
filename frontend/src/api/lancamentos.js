import api from "./axios";

export const listarLancamentos = (filtros = {}) => {
  const { processo_id, tipo } = filtros;
  const params = {};

  if (processo_id) params.processo_id = processo_id;
  if (tipo) params.tipo = tipo;

  return api.get("/lancamentos", { params });
};

export const criarLancamento = (dados) => api.post("/lancamentos", dados);

export const atualizarLancamento = (id, dados) =>
  api.put(`/lancamentos/${id}`, dados);

export const deletarLancamento = (id) => api.delete(`/lancamentos/${id}`);

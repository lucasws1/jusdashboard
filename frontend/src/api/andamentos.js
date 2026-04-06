import api from "./axios";

export const listarAndamentos = ({ processo_id } = {}) =>
  api.get("/andamentos", { params: processo_id ? { processo_id } : {} });

export const criarAndamento = (dados) => api.post("/andamentos", dados);

export const atualizarAndamento = (id, dados) =>
  api.put(`/andamentos/${id}`, dados);

export const deletarAndamento = (id) => api.delete(`/andamento/${id}`);

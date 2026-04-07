import api from "./axios";

export const listarProcessos = ({ cliente_id, status, busca } = {}) => {
  const params = {};
  if (cliente_id) params.cliente_id = cliente_id;
  if (status) params.status = status;
  if (busca) params.busca = busca;
  // console.log(status);

  return api.get("/processos", { params });
};

export const obterProcesso = (id) => api.get(`/processos/${id}`);

export const criarProcesso = (dados) => api.post("/processos", dados);

export const atualizarProcesso = (id, dados) =>
  api.put(`/processos/${id}`, dados);

export const deletarProcesso = (id) => api.delete(`/processos/${id}`);

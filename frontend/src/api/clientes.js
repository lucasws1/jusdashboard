import api from "./axios";

export const listarClientes = (busca) =>
  api.get("/clientes", { params: busca ? { busca } : {} });

export const criarCliente = (dados) => api.post("/clientes", dados);

export const atualizarCliente = (id, dados) =>
  api.put(`/clientes/${id}`, dados);

export const deletarCliente = (id) => api.delete(`/clientes/${id}`);

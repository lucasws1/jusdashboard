import api from "./axios";

export const fazerLogin = (credenciais) => api.post("/auth/login", credenciais);

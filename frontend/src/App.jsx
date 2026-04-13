import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Clientes from "./pages/Clientes";
import DetalhesCliente from "./pages/DetalhesCliente";
import Processos from "./pages/Processos";
import DetalhesProcesso from "./pages/DetalhesProcesso";
import Prazos from "./pages/Prazos";
import Andamentos from "./pages/Andamentos";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/clientes/:id" element={<DetalhesCliente />} />
              <Route path="/processos" element={<Processos />} />
              <Route path="/processos/:id" element={<DetalhesProcesso />} />
              <Route path="/prazos" element={<Prazos />} />
              <Route path="/andamentos" element={<Andamentos />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

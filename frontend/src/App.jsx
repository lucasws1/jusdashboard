import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Clientes from "./pages/Clientes";
import Sidebar from "./components/Sidebar";
import Processos from "./pages/Processos";
import Prazos from "./pages/Prazos";
import Andamentos from "./pages/Andamentos";
import DetalhesProcesso from "./pages/DetalhesProcesso";

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/clientes" replace />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/processos" element={<Processos />} />
            <Route path="/processos/:id" element={<DetalhesProcesso />} />
            <Route path="/prazos" element={<Prazos />} />
            <Route path="/andamentos" element={<Andamentos />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

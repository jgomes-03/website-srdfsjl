import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import HomePage from "@/pages/HomePage";
import HistoriaPage from "@/pages/HistoriaPage";
import EventosPage from "@/pages/EventosPage";
import ServicosPage from "@/pages/ServicosPage";
import ContactosPage from "@/pages/ContactosPage";
import InscricaoPage from "@/pages/InscricaoPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import AdminDashboard from "@/pages/AdminDashboard";
import { AuthProvider } from "@/context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/historia" element={<HistoriaPage />} />
            <Route path="/eventos" element={<EventosPage />} />
            <Route path="/servicos" element={<ServicosPage />} />
            <Route path="/contactos" element={<ContactosPage />} />
            <Route path="/inscricao" element={<InscricaoPage />} />
          </Route>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

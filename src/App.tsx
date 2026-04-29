import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import ListingDetail from "./pages/ListingDetail";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import CreateListing from "./pages/CreateListing";
import TermosPage from "./pages/TermosPage";
import PrivacidadePage from "./pages/PrivacidadePage";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import MessagesPage from "./pages/MessagesPage";
import EditListing from "./pages/EditListing";
import ComoFunciona from "./pages/ComoFunciona";
import Beneficios from "./pages/Beneficios";
import RedefinirSenhaPage from "./pages/RedefinirSenhaPage";

const queryClient = new QueryClient();

function AppRoutes() {
  const { authLoading } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    // Capturar tokens do Supabase na URL (recuperacao de senha, confirmacao de email)
    const hash = window.location.hash;
    if (hash.includes("access_token") && hash.includes("type=recovery")) {
      navigate("/redefinir-senha");
    }
  }, []);

  if (authLoading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/busca" element={<SearchPage />} />
          <Route path="/anuncio/:id" element={<ListingDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/criar-anuncio" element={<CreateListing />} />
          <Route path="/como-funciona" element={<ComoFunciona />} />
          <Route path="/beneficios" element={<Beneficios />} />
          <Route path="/mensagens" element={<MessagesPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/editar-anuncio/:id" element={<EditListing />} />
          <Route path="/termos" element={<TermosPage />} />
          <Route path="/privacidade" element={<PrivacidadePage />} />
          <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
      <AppInner />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

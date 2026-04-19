import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom"; 
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index";
import SearchPage from "./pages/SearchPage";
import ListingDetail from "./pages/ListingDetail";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import CreateListing from "./pages/CreateListing";
import NotFound from "./pages/NotFound";
import ComoFunciona from "./pages/ComoFunciona";
import Beneficios from "./pages/Beneficios";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
<HashRouter>
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/busca" element={<SearchPage />} />
        ...
      </Routes>
    </main>
    <Footer />
  </div>
</HashRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

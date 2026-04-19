import { Link } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Menu, X, Tractor } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { user, logout } = useApp();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold">
          <Tractor className="h-7 w-7 text-accent" />
          AgroAluga
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/como-funciona" className="hover:text-accent transition-colors">Como Funciona</Link>
          <Link to="/busca" className="hover:text-accent transition-colors">Equipamentos</Link>
          <Link to="/beneficios" className="hover:text-accent transition-colors">Beneficios</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" className="text-primary-foreground hover:text-accent hover:bg-primary-medium">
                  Dashboard
                </Button>
              </Link>
              <Link to="/mensagens">
                <Button variant="ghost" className="text-primary-foreground hover:text-accent hover:bg-primary-medium">
                  Mensagens
                </Button>
              </Link>
              <Button variant="ghost" className="text-primary-foreground hover:text-accent hover:bg-primary-medium" onClick={() => logout()}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-primary-foreground hover:text-accent hover:bg-primary-medium">Entrar</Button>
              </Link>
              <Link to="/cadastro">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">Cadastrar</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-primary border-t border-primary-medium px-4 pb-4 space-y-2">
          <Link to="/como-funciona" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>Como Funciona</Link>
          <Link to="/busca" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>Equipamentos</Link>
          <Link to="/beneficios" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>Beneficios</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link to="/mensagens" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>Mensagens</Link>
              <button className="block py-2 hover:text-accent" onClick={() => { logout(); setOpen(false); }}>Sair</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>Entrar</Link>
              <Link to="/cadastro" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>Cadastrar</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

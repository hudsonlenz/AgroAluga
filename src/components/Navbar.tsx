import { Link, useLocation } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Menu, X, Tractor, ChevronDown, LayoutDashboard, MessageCircle, ShieldCheck, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";

export default function Navbar() {
  const { user, logout } = useApp();
  const location = useLocation();
  const showAnuncieBtn = location.pathname !== "/criar-anuncio";
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.from("profiles").select("is_admin").eq("id", user.id).single()
      .then(({ data }) => setIsAdmin(data?.is_admin || false));
  }, [user]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          {showAnuncieBtn && (
            <Link to={user ? "/criar-anuncio" : "/cadastro"}>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold gap-2 shadow-sm">
                + Anuncie agora
              </Button>
            </Link>
          )}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity px-2 py-1 rounded-lg hover:bg-primary-medium"
              >
                <UserAvatar userId={user.id} name={user.name} size="sm" />
                <span className="text-sm font-medium">{user.name.split(" ")[0]}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-52 bg-card border border-border rounded-lg shadow-xl py-1 z-50">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="font-medium text-sm text-card-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <Link to="/perfil" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-card-foreground hover:bg-secondary transition-colors">
                    <User className="h-4 w-4 text-muted-foreground" /> Meu Perfil
                  </Link>
                  <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-card-foreground hover:bg-secondary transition-colors">
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Dashboard
                  </Link>
                  <Link to="/mensagens" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-card-foreground hover:bg-secondary transition-colors">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" /> Mensagens
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-card-foreground hover:bg-secondary transition-colors">
                      <ShieldCheck className="h-4 w-4 text-muted-foreground" /> Admin
                    </Link>
                  )}
                  <div className="border-t border-border mt-1">
                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-secondary transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" /> Sair
                    </button>
                  </div>
                </div>
              )}
            </div>
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
          {showAnuncieBtn && (
            <Link to={user ? "/criar-anuncio" : "/cadastro"}
              className="block py-2 text-accent font-semibold hover:text-accent/80"
              onClick={() => setOpen(false)}>
              + Anuncie agora
            </Link>
          )}
          {user ? (
            <>
              <div className="flex items-center gap-2 py-2 border-t border-primary-medium">
                <UserAvatar userId={user.id} name={user.name} size="sm" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <Link to="/perfil" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>Meu Perfil</Link>
              <Link to="/dashboard" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>Dashboard</Link>
              <Link to="/mensagens" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>Mensagens</Link>
              {isAdmin && (
                <Linpython3 << 'PYEOF'
with open('src/pages/RedefinirSenhaPage.tsx', 'r') as f:
    content = f.read()

old = '''        <h2 className="text-xl font-heading font-bold mb-2">Link invalido ou expirado</h2>
        <p className="text-muted-foreground mb-6">
          Solicite um novo link de redefinicao de senha.
        </p>
        <Button className="bg-primary text-primary-foreground w-full" onClick={() => navigate("/login")}>
          Solicitar novo link
        </Button>'''

new = '''        <h2 className="text-xl font-heading font-bold mb-2">Problema ao redefinir senha</h2>
        <p className="text-muted-foreground mb-4">
          Houve um problema ao processar seu link. Por favor entre em contato com o suporte:
        </p>
        <a href="mailto:agroaluga@outlook.com" className="text-primary font-medium hover:underline block mb-6">
          agroaluga@outlook.com
        </a>
        <Button className="bg-primary text-primary-foreground w-full" onClick={() => navigate("/login")}>
          Voltar ao login
        </Button>'''
content = content.replace(old, new)

with open('src/pages/RedefinirSenhaPage.tsx', 'w') as f:
    f.write(content)
print("Done")
PYEOF

git add .
git commit -m "fix: mensagem amigavel no link expirado de redefinicao"
git pushk to="/admin" className="block py-2 hover:text-accent" onClick={() => setOpen(false)}>Admin</Link>
              )}
              <button className="block py-2 hover:text-accent text-left w-full" onClick={() => { logout(); setOpen(false); }}>Sair</button>
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
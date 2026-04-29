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
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.from("profiles").select("is_admin").eq("id", user.id).single()
      .then(({ data }) => setIsAdmin(data?.is_admin || false));
  }, [user]);

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    fetchUnread();
    const channel = supabase
      .channel("unread-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => fetchUnread())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "messages" }, () => fetchUnread())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  async function fetchUnread() {
    // versao simplificada
    // versao simplificada
    if (!user) return;
    const { data: convs } = await supabase
      .from("conversations")
      .select("id")
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
    if (!convs || convs.length === 0) { setUnreadCount(0); return; }
    const convIds = convs.map((c: any) => c.id);
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .in("conversation_id", convIds)
      .or("read.eq.false,read.is.null")
      .neq("sender_id", user.id);
    setUnreadCount(count || 0);
  }

  useEffect(() => {
    if (location.pathname === "/mensagens") {
      setTimeout(fetchUnread, 1000);
    }
  }, [location.pathname]);

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
          
          <Link to="/beneficios" className="hover:text-accent transition-colors">Benefícios</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {showAnuncieBtn && (
            <Link to={user ? "/criar-anuncio" : "/cadastro"}>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold gap-2 shadow-sm">
                + Anuncie agora
              </Button>
            </Link>
          )}
          <NotificationButton />
            {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity px-2 py-1 rounded-lg hover:bg-primary-medium"
              >
                <div className="relative">
                  <UserAvatar userId={user.id} name={user.name} size="sm" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
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
                  <Link to="/mensagens" onClick={() => { setDropdownOpen(false); }}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-card-foreground hover:bg-secondary transition-colors">
                    <div className="relative">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full" />
                      )}
                    </div>
                    Mensagens
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-destructive text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
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
          {open ? <X className="h-6 w-6" /> : (
            <div className="relative">
              <Menu className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          )}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-primary border-t border-primary-medium px-4 pb-4">
          <div className="space-y-1 pt-2">
            <Link to="/como-funciona" className="block py-2.5 hover:text-accent transition-colors text-sm" onClick={() => setOpen(false)}>Como Funciona</Link>
            
            <Link to="/beneficios" className="block py-2.5 hover:text-accent transition-colors text-sm" onClick={() => setOpen(false)}>Benefícios</Link>
            {showAnuncieBtn && (
              <Link to={user ? "/criar-anuncio" : "/cadastro"}
                className="block py-2.5 text-accent font-semibold hover:text-accent/80 text-sm"
                onClick={() => setOpen(false)}>
                + Anuncie agora
              </Link>
            )}
          </div>

          <NotificationButton />
            {user ? (
            <>
              <div className="border-t border-white/20 mt-3 pt-3 flex items-center gap-2 pb-2">
                <UserAvatar userId={user.id} name={user.name} size="sm" />
                <span className="text-sm font-medium">{user.name}</span>
              </div>
              <div className="space-y-1">
                <Link to="/perfil" className="block py-2.5 hover:text-accent text-sm" onClick={() => setOpen(false)}>Meu Perfil</Link>
                <Link to="/dashboard" className="block py-2.5 hover:text-accent text-sm" onClick={() => setOpen(false)}>Dashboard</Link>
                <Link to="/mensagens" className="flex items-center justify-between py-2.5 hover:text-accent text-sm" onClick={() => setOpen(false)}>
                  <span>Mensagens</span>
                  {unreadCount > 0 && (
                    <span className="bg-destructive text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="block py-2.5 hover:text-accent text-sm" onClick={() => setOpen(false)}>Admin</Link>
                )}
                <button className="block py-2.5 text-left w-full text-sm text-destructive/80 hover:text-destructive" onClick={() => { logout(); setOpen(false); }}>Sair</button>
              </div>
            </>
          ) : (
            <div className="border-t border-white/20 mt-3 pt-3 space-y-2">
              <p className="text-xs text-primary-foreground/50 uppercase tracking-wider mb-2">Minha conta</p>
              <Link to="/login" onClick={() => setOpen(false)}>
                <button className="w-full py-2.5 rounded-lg border border-white/30 text-primary-foreground text-sm font-medium hover:bg-white/10 transition-colors">
                  Entrar
                </button>
              </Link>
              <Link to="/cadastro" onClick={() => setOpen(false)}>
                <button className="w-full py-2.5 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-colors mt-2">
                  Cadastrar gratuitamente
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

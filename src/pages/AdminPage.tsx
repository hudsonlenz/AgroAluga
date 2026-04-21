import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, X, Eye, Users, LayoutList, Search, Filter, BarChart3, TrendingUp, MessageCircle, Star, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import UserAvatar from "@/components/UserAvatar";

interface KPIs {
  total_users: number;
  new_users_7d: number;
  new_users_30d: number;
  blocked_users: number;
  total_listings: number;
  active_listings: number;
  pending_listings: number;
  paused_listings: number;
  rejected_listings: number;
  new_listings_7d: number;
  new_listings_30d: number;
  total_conversations: number;
  new_conversations_7d: number;
  total_messages: number;
  new_messages_7d: number;
  total_reviews: number;
  reported_reviews: number;
  avg_rating: number;
}

interface PendingListing {
  id: string;
  title: string;
  category: string;
  description: string;
  price: number;
  price_unit: string;
  city: string;
  state: string;
  images: string[];
  owner_name: string;
  owner_id: string;
  owner_email: string;
  created_at: string;
  status: string;
  listing_type: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  account_type: string;
  user_code: string;
  created_at: string;
  is_admin: boolean;
  blocked: boolean;
  block_reason: string;
}

export default function AdminPage() {
  const { user, authLoading } = useApp();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "listings" | "users">("overview");

  // Growth data state
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [growthPeriod, setGrowthPeriod] = useState(30);

  // Growth data state

  // KPIs state
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [kpisLoading, setKpisLoading] = useState(true);

  // Listings state
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [selected, setSelected] = useState<PendingListing | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<"pending" | "active" | "paused" | "rejected">("pending");
  const [userFilter, setUserFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Users state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");

  useEffect(() => { checkAdmin(); }, [user]);
  useEffect(() => { if (isAdmin) { fetchListings(); fetchUsers(); fetchPendingCount(); fetchKpis(); } }, [isAdmin, statusFilter]);
  useEffect(() => { if (isAdmin) fetchGrowthData(); }, [isAdmin, growthPeriod]);

  async function fetchGrowthData() {
    const { data } = await supabase.rpc("get_growth_data", { days_back: growthPeriod });
    if (!data) return;

    if (growthPeriod <= 90) {
      // Diario — mostrar todos os pontos
      setGrowthData(data.map((d: any) => ({
        ...d,
        day: new Date(d.day).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      })));
    } else {
      // Agrupar por mes para periodos longos
      const monthly: Record<string, any> = {};
      data.forEach((d: any) => {
        const date = new Date(d.day);
        const key = date.toLocaleDateString("pt-BR", { month: "2-digit", year: "2-digit" });
        if (!monthly[key]) {
          monthly[key] = {
            day: key,
            total_users: 0,
            new_users: 0,
            total_listings: 0,
            new_listings: 0,
            new_messages: 0,
            new_conversations: 0,
          };
        }
        monthly[key].total_users = Number(d.total_users);
        monthly[key].total_listings = Number(d.total_listings);
        monthly[key].new_users += Number(d.new_users);
        monthly[key].new_listings += Number(d.new_listings);
        monthly[key].new_messages += Number(d.new_messages);
        monthly[key].new_conversations += Number(d.new_conversations);
      });
      setGrowthData(Object.values(monthly));
    }
  }

  async function fetchKpis() {
    setKpisLoading(true);
    const { data } = await supabase.from("admin_kpis").select("*").single();
    if (data) setKpis(data);
    setKpisLoading(false);
  }

  async function fetchPendingCount() {
    const { count } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");
    setPendingCount(count || 0);
  }

  async function checkAdmin() {
    if (!user) { setIsAdmin(false); return; }
    const { data } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
    setIsAdmin(data?.is_admin || false);
  }

  async function fetchListings() {
    setListingsLoading(true);
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("status", statusFilter)
      .order("created_at", { ascending: false });
    if (data) setListings(data);
    setListingsLoading(false);
  }

  async function fetchUsers() {
    setUsersLoading(true);
    const { data } = await supabase
      .from("admin_users_view")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setUsers(data);
    setUsersLoading(false);
  }

  async function toggleBlock(userId: string, current: boolean) {
    const reason = current ? null : prompt("Motivo do bloqueio (opcional):");
    if (!current && reason === null) return; // cancelou
    await supabase.from("profiles").update({
      blocked: !current,
      block_reason: reason || null,
    }).eq("id", userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, blocked: !current, block_reason: reason || "" } : u));
  }

  async function sendAdminMessage(userEmail: string, userName: string) {
    const message = prompt(`Mensagem para ${userName}:`);
    if (!message) return;
    await supabase.functions.invoke("notify-new-message", {
      body: {
        recipient_email: userEmail,
        recipient_name: userName,
        sender_name: "Equipe AgroAluga",
        listing_title: "Mensagem da Administração",
        message_preview: message,
      },
    });
    alert("Mensagem enviada com sucesso!");
  }

  async function approve(id: string) {
    setProcessing(id);
    const listing = listings.find((l) => l.id === id);
    await supabase.from("listings").update({ status: "active" }).eq("id", id);
    if (listing) {
      await supabase.functions.invoke("notify-listing-status", {
        body: { listing_title: listing.title, owner_email: listing.owner_email, owner_name: listing.owner_name, status: "active" },
      });
    }
    setListings((prev) => prev.filter((l) => l.id !== id));
    if (selected?.id === id) setSelected(null);
    setProcessing(null);
  }

  async function reject(id: string) {
    setProcessing(id);
    const listing = listings.find((l) => l.id === id);
    await supabase.from("listings").update({ status: "rejected" }).eq("id", id);
    if (listing) {
      await supabase.functions.invoke("notify-listing-status", {
        body: { listing_title: listing.title, owner_email: listing.owner_email, owner_name: listing.owner_name, status: "rejected" },
      });
    }
    setListings((prev) => prev.filter((l) => l.id !== id));
    if (selected?.id === id) setSelected(null);
    setProcessing(null);
  }

  async function changeListingStatus(id: string, newStatus: string) {
    setProcessing(id);
    await supabase.from("listings").update({ status: newStatus }).eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    if (selected?.id === id) setSelected(null);
    setProcessing(null);
    fetchPendingCount();
  }

  async function deleteListing(id: string) {
    if (!confirm("Tem certeza que deseja DELETAR este anuncio permanentemente?")) return;
    setProcessing(id);
    await supabase.from("listings").delete().eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    if (selected?.id === id) setSelected(null);
    setProcessing(null);
  }

  async function toggleAdmin(userId: string, current: boolean) {
    await supabase.from("profiles").update({ is_admin: !current }).eq("id", userId);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_admin: !current } : u));
  }

  const filteredListings = listings.filter((l) => {
    const matchUser = userFilter === "" || l.owner_name.toLowerCase().includes(userFilter.toLowerCase()) || l.owner_email?.toLowerCase().includes(userFilter.toLowerCase());
    const matchType = typeFilter === "all" || l.listing_type === typeFilter;
    return matchUser && matchType;
  });

  const filteredUsers = users.filter((u) =>
    userSearch === "" ||
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.user_code?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.city?.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" />;
  if (isAdmin === false) return <Navigate to="/" />;
  if (isAdmin === null) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Verificando permissões...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Painel Admin</h1>
          <p className="text-sm text-muted-foreground">Gestao completa da plataforma</p>
        </div>
        <div className="flex gap-2 bg-secondary rounded-lg p-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "overview" ? "bg-card shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <BarChart3 className="h-4 w-4" /> Visao Geral
          </button>
          <button
            onClick={() => setActiveTab("listings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "listings" ? "bg-card shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutList className="h-4 w-4" /> Anuncios
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "users" ? "bg-card shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Users className="h-4 w-4" /> Usuarios
            <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">{users.length}</span>
          </button>
        </div>
      </div>

      {/* ABA VISAO GERAL */}
      {activeTab === "overview" && (
        <div>
          {kpisLoading ? (
            <p className="text-muted-foreground text-sm">Carregando indicadores...</p>
          ) : kpis ? (
            <div className="grid md:grid-cols-4 gap-6">

              {/* Coluna de KPIs */}
              <div className="md:col-span-1 space-y-3">

                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Usuarios</p>
                  <div className="space-y-2">
                    {[
                      { label: "Total", value: kpis.total_users, color: "text-primary" },
                      { label: "Novos (7d)", value: kpis.new_users_7d, color: "text-green-600" },
                      { label: "Novos (30d)", value: kpis.new_users_30d, color: "text-blue-600" },
                      { label: "Bloqueados", value: kpis.blocked_users, color: "text-destructive" },
                    ].map((k) => (
                      <div key={k.label} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{k.label}</span>
                        <span className={`text-sm font-bold ${k.color}`}>{k.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-1"><LayoutList className="h-3.5 w-3.5" /> Anuncios</p>
                  <div className="space-y-2">
                    {[
                      { label: "Total", value: kpis.total_listings, color: "text-primary" },
                      { label: "Ativos", value: kpis.active_listings, color: "text-green-600" },
                      { label: "Pendentes", value: kpis.pending_listings, color: "text-yellow-600" },
                      { label: "Pausados", value: kpis.paused_listings, color: "text-orange-500" },
                      { label: "Rejeitados", value: kpis.rejected_listings, color: "text-destructive" },
                      { label: "Novos (7d)", value: kpis.new_listings_7d, color: "text-blue-600" },
                      { label: "Novos (30d)", value: kpis.new_listings_30d, color: "text-blue-400" },
                    ].map((k) => (
                      <div key={k.label} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{k.label}</span>
                        <span className={`text-sm font-bold ${k.color}`}>{k.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> Engajamento</p>
                  <div className="space-y-2">
                    {[
                      { label: "Conversas", value: kpis.total_conversations, color: "text-primary" },
                      { label: "Novas (7d)", value: kpis.new_conversations_7d, color: "text-green-600" },
                      { label: "Mensagens", value: kpis.total_messages, color: "text-blue-600" },
                      { label: "Msg (7d)", value: kpis.new_messages_7d, color: "text-blue-400" },
                    ].map((k) => (
                      <div key={k.label} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{k.label}</span>
                        <span className={`text-sm font-bold ${k.color}`}>{k.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-3 flex items-center gap-1"><Star className="h-3.5 w-3.5" /> Qualidade</p>
                  <div className="space-y-2">
                    {[
                      { label: "Avaliações", value: kpis.total_reviews, color: "text-primary" },
                      { label: "Nota media", value: Number(kpis.avg_rating).toFixed(1) + " ★", color: "text-accent" },
                      { label: "Reportadas", value: kpis.reported_reviews, color: kpis.reported_reviews > 0 ? "text-destructive" : "text-green-600" },
                    ].map((k) => (
                      <div key={k.label} className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">{k.label}</span>
                        <span className={`text-sm font-bold ${k.color}`}>{k.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Coluna de Gráficos */}
              <div className="md:col-span-3 space-y-6">

                {/* Seletor de período */}
                <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-3">
                  <span className="text-sm font-medium text-muted-foreground mr-2">Periodo:</span>
                  {[
                    { label: "30 dias", value: 30 },
                    { label: "90 dias", value: 90 },
                    { label: "1 ano", value: 365 },
                    { label: "Tudo", value: 1825 },
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setGrowthPeriod(p.value)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${growthPeriod === p.value ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"}`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Crescimento de usuários */}
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Crescimento de Usuarios
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={4} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="total_users" name="Total" stroke="#2d5a1b" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="new_users" name="Novos/dia" stroke="#86c44e" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Crescimento de anúncios */}
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                    <LayoutList className="h-4 w-4 text-primary" /> Anuncios Publicados
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={4} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="total_listings" name="Total" stroke="#d97706" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="new_listings" name="Novos/dia" stroke="#fbbf24" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Mensagens e conversas */}
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="font-heading font-semibold mb-4 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-primary" /> Engajamento Diario
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={growthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={4} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="new_messages" name="Mensagens" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="new_conversations" name="Conversas" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Nao foi possivel carregar os indicadores.</p>
          )}
        </div>
      )}

            {/* ABA ANÚNCIOS */}
      {activeTab === "listings" && (
        <div>
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 mb-6 bg-card border border-border rounded-lg p-4">
            <div className="flex gap-2 flex-wrap">
              {(["pending", "active", "paused", "rejected"] as const).map((s) => (
                <Button key={s} variant={statusFilter === s ? "default" : "outline"} size="sm"
                  onClick={() => { setStatusFilter(s); setSelected(null); }}
                  className={statusFilter === s ? "bg-primary text-primary-foreground" : ""}>
                  {s === "pending" ? "Pendentes" : s === "active" ? "Ativos" : s === "paused" ? "Pausados" : "Rejeitados"}
                  {s === "pending" && pendingCount > 0 && statusFilter !== "pending" && (
                    <span className="ml-1 bg-accent text-accent-foreground text-xs px-1.5 rounded-full">{pendingCount}</span>
                  )}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 ml-auto">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="equipamento">Equipamentos</SelectItem>
                  <SelectItem value="servico">Servicos</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuario..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="pl-7 h-8 text-xs w-48"
                />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Lista */}
            <div className="space-y-3">
              {listingsLoading ? (
                <p className="text-muted-foreground text-sm">Carregando...</p>
              ) : filteredListings.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
                  Nenhum anuncio encontrado.
                </div>
              ) : filteredListings.map((l) => (
                <div key={l.id}
                  className={`bg-card border rounded-lg p-4 cursor-pointer transition-all ${selected?.id === l.id ? "border-primary shadow-md" : "border-border hover:border-primary/50"}`}
                  onClick={() => setSelected(l)}
                >
                  <div className="flex items-center gap-3">
                    <img src={l.images?.[0] || "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=80&h=80&fit=crop"}
                      alt="" className="h-14 w-14 rounded-md object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{l.title}</p>
                      <p className="text-xs text-muted-foreground">{l.category} — {l.city}, {l.state}</p>
                      <p className="text-xs text-muted-foreground">Por: {l.owner_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.listing_type === "servico" ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary"}`}>
                          {l.listing_type === "servico" ? "Servico" : "Equipamento"}
                        </span>
                        <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>
                    {statusFilter === "pending" && (
                      <div className="flex gap-1">
                        <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 hover:bg-green-50"
                          onClick={(e) => { e.stopPropagation(); approve(l.id); }} disabled={processing === l.id}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          onClick={(e) => { e.stopPropagation(); reject(l.id); }} disabled={processing === l.id}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Detalhe */}
            <div>
              {selected ? (
                <div className="bg-card border border-border rounded-lg p-6 space-y-4 sticky top-24">
                  <h2 className="font-heading font-bold text-lg">{selected.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    {selected.images?.map((img, i) => (
                      <img key={i} src={img} alt="" className="h-24 w-24 rounded-md object-cover" />
                    ))}
                  </div>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Tipo:</span> {selected.listing_type === "servico" ? "Servico" : "Equipamento"}</p>
                    <p><span className="font-medium">Categoria:</span> {selected.category}</p>
                    <p><span className="font-medium">Preco:</span> R$ {selected.price}/{selected.price_unit}</p>
                    <p><span className="font-medium">Local:</span> {selected.city}, {selected.state}</p>
                    <p><span className="font-medium">Anunciante:</span> {selected.owner_name}</p>
                    <p><span className="font-medium">E-mail:</span> {selected.owner_email}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">Descrição:</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
                  </div>
                  <div className="space-y-2 pt-2 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase">Ações do Admin</p>
                    <div className="flex gap-2 flex-wrap">
                      {statusFilter === "pending" && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1"
                          onClick={() => approve(selected.id)} disabled={processing === selected.id}>
                          <Check className="h-3.5 w-3.5" /> Aprovar
                        </Button>
                      )}
                      {statusFilter !== "active" && statusFilter !== "pending" && (
                        <Button size="sm" className="bg-primary text-primary-foreground gap-1"
                          onClick={() => changeListingStatus(selected.id, "active")} disabled={processing === selected.id}>
                          <Check className="h-3.5 w-3.5" /> Ativar
                        </Button>
                      )}
                      {statusFilter === "active" && (
                        <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-400 hover:bg-yellow-50 gap-1"
                          onClick={() => changeListingStatus(selected.id, "paused")} disabled={processing === selected.id}>
                          Pausar
                        </Button>
                      )}
                      {statusFilter === "paused" && (
                        <Button size="sm" variant="outline" className="text-green-600 border-green-400 hover:bg-green-50 gap-1"
                          onClick={() => changeListingStatus(selected.id, "active")} disabled={processing === selected.id}>
                          Reativar
                        </Button>
                      )}
                      {statusFilter === "pending" && (
                        <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive/10 gap-1"
                          onClick={() => reject(selected.id)} disabled={processing === selected.id}>
                          <X className="h-3.5 w-3.5" /> Rejeitar
                        </Button>
                      )}
                      {statusFilter !== "pending" && (
                        <Button size="sm" variant="outline" className="text-destructive border-destructive hover:bg-destructive/10 gap-1"
                          onClick={() => changeListingStatus(selected.id, "rejected")} disabled={processing === selected.id}>
                          <X className="h-3.5 w-3.5" /> Rejeitar
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="text-destructive border-destructive bg-destructive/5 hover:bg-destructive hover:text-white gap-1"
                        onClick={() => deleteListing(selected.id)} disabled={processing === selected.id}>
                        Deletar permanentemente
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  Selecione um anúncio para ver os detalhes
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ABA USUÁRIOS */}
      {activeTab === "users" && (
        <div>
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, código ou cidade..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <p className="text-sm text-muted-foreground self-center">{filteredUsers.length} usuário(s)</p>
          </div>

          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground">Usuário</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Código</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">E-mail</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Localização</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Cadastro</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usersLoading ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Carregando...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Nenhum usuário encontrado.</td></tr>
                ) : filteredUsers.map((u, i) => (
                  <tr key={u.id} className={`border-t border-border hover:bg-secondary/50 transition-colors ${(u as any).blocked ? "bg-destructive/5" : i % 2 === 0 ? "" : "bg-secondary/20"}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar userId={u.id} name={u.name || ""} size="sm" />
                        <div>
                          <div className="flex items-center gap-1 flex-wrap">
                            <p className="font-medium">{u.name}</p>
                            {(u as any).blocked && <span className="text-xs bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">Bloqueado</span>}
                            {u.is_admin && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Admin</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{u.phone || "—"}</p>
                          {(u as any).blocked && (u as any).block_reason && (
                            <p className="text-xs text-destructive">Motivo: {(u as any).block_reason}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {u.user_code || "—"}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {(u as any).email || "—"}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {u.city && u.state ? `${u.city}, ${u.state}` : "—"}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {new Date(u.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-3">
                      {u.id === user.id ? (
                        <span className="text-xs text-muted-foreground">Voce</span>
                      ) : (
                        <div className="flex gap-1 flex-wrap">
                          <button
                            onClick={() => sendAdminMessage((u as any).email, u.name)}
                            className="text-xs px-2 py-1 rounded font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            Mensagem
                          </button>
                          <button
                            onClick={() => toggleBlock(u.id, (u as any).blocked)}
                            className={`text-xs px-2 py-1 rounded font-medium transition-colors ${(u as any).blocked ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-destructive/10 text-destructive hover:bg-destructive/20"}`}
                          >
                            {(u as any).blocked ? "Desbloquear" : "Bloquear"}
                          </button>
                          <button
                            onClick={() => toggleAdmin(u.id, u.is_admin)}
                            className={`text-xs px-2 py-1 rounded font-medium transition-colors ${u.is_admin ? "bg-primary/10 text-primary hover:bg-destructive/10 hover:text-destructive" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}
                          >
                            {u.is_admin ? "Admin ✓" : "+ Admin"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
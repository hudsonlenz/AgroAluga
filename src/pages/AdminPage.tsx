import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Check, X, Eye } from "lucide-react";

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
  created_at: string;
  status: string;
}

export default function AdminPage() {
  const { user } = useApp();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [listings, setListings] = useState<PendingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<PendingListing | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "active" | "rejected">("pending");

  useEffect(() => {
    checkAdmin();
  }, [user]);

  useEffect(() => {
    if (isAdmin) fetchListings();
  }, [isAdmin, filter]);

  async function checkAdmin() {
    if (!user) { setIsAdmin(false); return; }
    const { data } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    setIsAdmin(data?.is_admin || false);
  }

  async function fetchListings() {
    setLoading(true);
    const { data } = await supabase
      .from("listings")
      .select("*")
      .eq("status", filter)
      .order("created_at", { ascending: false });
    if (data) setListings(data);
    setLoading(false);
  }

  async function approve(id: string) {
    setProcessing(id);
    await supabase.from("listings").update({ status: "active" }).eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    if (selected?.id === id) setSelected(null);
    setProcessing(null);
  }

  async function reject(id: string) {
    setProcessing(id);
    await supabase.from("listings").update({ status: "rejected" }).eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    if (selected?.id === id) setSelected(null);
    setRejectReason("");
    setProcessing(null);
  }

  if (!user) return <Navigate to="/login" />;
  if (isAdmin === false) return <Navigate to="/" />;
  if (isAdmin === null) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Verificando permissoes...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Painel Admin</h1>
          <p className="text-sm text-muted-foreground">Moderacao de anuncios</p>
        </div>
        <div className="flex gap-2">
          {(["pending", "active", "rejected"] as const).map((s) => (
            <Button
              key={s}
              variant={filter === s ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(s)}
              className={filter === s ? "bg-primary text-primary-foreground" : ""}
            >
              {s === "pending" ? "Pendentes" : s === "active" ? "Aprovados" : "Rejeitados"}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Lista */}
        <div className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : listings.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
              Nenhum anuncio {filter === "pending" ? "pendente" : filter === "active" ? "aprovado" : "rejeitado"}.
            </div>
          ) : listings.map((l) => (
            <div
              key={l.id}
              className={`bg-card border rounded-lg p-4 cursor-pointer transition-all ${selected?.id === l.id ? "border-primary shadow-md" : "border-border hover:border-primary/50"}`}
              onClick={() => setSelected(l)}
            >
              <div className="flex items-center gap-3">
                <img src={l.images?.[0] || "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=80&h=80&fit=crop"} alt="" className="h-16 w-16 rounded-md object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{l.title}</p>
                  <p className="text-xs text-muted-foreground">{l.category} — {l.city}, {l.state}</p>
                  <p className="text-xs text-muted-foreground">Por: {l.owner_name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("pt-BR")}</p>
                </div>
                {filter === "pending" && (
                  <div className="flex gap-1">
                    <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={(e) => { e.stopPropagation(); approve(l.id); }} disabled={processing === l.id}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); reject(l.id); }} disabled={processing === l.id}>
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
                <p><span className="font-medium">Categoria:</span> {selected.category}</p>
                <p><span className="font-medium">Preco:</span> R$ {selected.price}/{selected.price_unit}</p>
                <p><span className="font-medium">Local:</span> {selected.city}, {selected.state}</p>
                <p><span className="font-medium">Anunciante:</span> {selected.owner_name}</p>
              </div>
              <div>
                <p className="font-medium text-sm mb-1">Descricao:</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{selected.description}</p>
              </div>
              {filter === "pending" && (
                <div className="flex gap-3 pt-2">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                    onClick={() => approve(selected.id)}
                    disabled={processing === selected.id}
                  >
                    <Check className="h-4 w-4" />
                    {processing === selected.id ? "Aprovando..." : "Aprovar"}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive border-destructive hover:bg-destructive/10 gap-2"
                    onClick={() => reject(selected.id)}
                    disabled={processing === selected.id}
                  >
                    <X className="h-4 w-4" />
                    {processing === selected.id ? "Rejeitando..." : "Rejeitar"}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center text-muted-foreground">
              <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Selecione um anuncio para ver os detalhes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

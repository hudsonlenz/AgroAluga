import { useApp } from "@/contexts/AppContext";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Users, Plus, Pencil, Trash2, PauseCircle, PlayCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function Dashboard() {
  const { user, listings, updateListing, authLoading } = useApp();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" />;

  const myListings = listings.filter((l) => l.ownerId === user.id && l.status !== "expired");
  const totalViews = myListings.reduce((s, l) => s + l.views, 0);
  const totalContacts = myListings.reduce((s, l) => s + l.contactsRevealed, 0);

  const stats = [
    { icon: Eye, label: "Visualizações", value: totalViews },
    { icon: Users, label: "Contatos Revelados", value: totalContacts },
  ];

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este anuncio?")) return;
    setDeleting(id);
    await supabase.from("listings").delete().eq("id", id);
    updateListing(id, { status: "expired" });
    setDeleting(null);
  };

  const handleTogglePause = async (id: string, currentStatus: string) => {
    setToggling(id);
    const newStatus = currentStatus === "active" ? "paused" : "active";
    await supabase.from("listings").update({ status: newStatus }).eq("id", id);
    updateListing(id, { status: newStatus as any });
    setToggling(null);
  };

  const statusLabel = (status: string) => {
    if (status === "active") return { label: "Ativo", className: "bg-primary/10 text-primary" };
    if (status === "paused") return { label: "Pausado", className: "bg-yellow-100 text-yellow-700" };
    if (status === "pending") return { label: "Pendente", className: "bg-accent/20 text-accent-foreground" };
    return { label: status, className: "bg-muted text-muted-foreground" };
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold">Ola, {user.name.split(" ")[0]}!</h1>
          <p className="text-muted-foreground text-sm">Gerencie seus anuncios e acompanhe seus resultados.</p>
        </div>
        <Link to="/criar-anuncio">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
            <Plus className="h-4 w-4 mr-2" /> Criar Anuncio
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-6 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <s.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-heading font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-heading font-bold mb-4">Meus Anuncios</h2>
      {myListings.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">Voce ainda nao tem anuncios.</p>
          <Link to="/criar-anuncio">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Criar primeiro anuncio</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myListings.map((l) => {
            const { label, className } = statusLabel(l.status);
            return (
              <div key={l.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <img src={l.images[0]} alt={l.title} className="h-16 w-16 rounded-md object-cover shrink-0" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-heading font-semibold truncate">{l.title}</p>
                      <Link to={`/anuncio/${l.id}`} className="text-muted-foreground hover:text-primary transition-colors shrink-0" title="Ver anuncio">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                    <p className="text-sm text-muted-foreground">{l.category} — R$ {l.price}/{l.priceUnit}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${className}`}>
                      {label}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {/* Pausar/Ativar — só para anúncios ativos ou pausados */}
                  {(l.status === "active" || l.status === "paused") && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={`gap-1 ${l.status === "paused" ? "text-green-600 hover:text-green-700" : "text-yellow-600 hover:text-yellow-700"}`}
                      onClick={() => handleTogglePause(l.id, l.status)}
                      disabled={toggling === l.id}
                      title={l.status === "active" ? "Pausar anuncio" : "Reativar anuncio"}
                    >
                      {toggling === l.id ? "..." : l.status === "active"
                        ? <><PauseCircle className="h-3.5 w-3.5" /> Pausar</>
                        : <><PlayCircle className="h-3.5 w-3.5" /> Reativar</>
                      }
                    </Button>
                  )}
                  <Link to={`/editar-anuncio/${l.id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(l.id)}
                    disabled={deleting === l.id}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> {deleting === l.id ? "..." : "Excluir"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

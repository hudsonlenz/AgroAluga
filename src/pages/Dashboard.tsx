import { initOneSignal } from "@/hooks/useNotifications";
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

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este anúncio?")) return;
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
              <div key={l.id} className="bg-card border border-border rounded-lg p-4 flex gap-4">
                {/* Imagem */}
                <img src={l.images[0]} alt={l.title} className="h-20 w-20 rounded-md object-cover shrink-0" />

                {/* Conteudo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-heading font-semibold truncate">{l.title}</p>
                        <Link to={`/anuncio/${l.id}`} className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{l.category} — R$ {l.price}/{l.priceUnit}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-1 ${className}`}>
                        {label}
                      </span>
                    </div>

                    {/* Botoes verticais */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {(l.status === "active" || l.status === "paused") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className={`gap-1 text-xs h-8 ${l.status === "paused" ? "text-green-600 hover:text-green-700" : "text-yellow-600 hover:text-yellow-700"}`}
                          onClick={() => handleTogglePause(l.id, l.status)}
                          disabled={toggling === l.id}
                        >
                          {toggling === l.id ? "..." : l.status === "active"
                            ? <><PauseCircle className="h-3 w-3" /> Pausar</>
                            : <><PlayCircle className="h-3 w-3" /> Reativar</>
                          }
                        </Button>
                      )}
                      <Link to={`/editar-anuncio/${l.id}`}>
                        <Button variant="outline" size="sm" className="gap-1 text-xs h-8 w-full">
                          <Pencil className="h-3 w-3" /> Editar
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-xs h-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(l.id)}
                        disabled={deleting === l.id}
                      >
                        <Trash2 className="h-3 w-3" /> {deleting === l.id ? "..." : "Excluir"}
                      </Button>
                    </div>
                  </div>

                  {/* Metricas individuais */}
                  <div className="flex gap-4 mt-2 pt-2 border-t border-border">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3 w-3" />
                      <span>{l.views} visualizacoes</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{l.contactsRevealed} contatos</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

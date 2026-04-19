import { useApp } from "@/contexts/AppContext";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Users, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useState } from "react";

export default function Dashboard() {
  const { user, listings, updateListing } = useApp();
  const [deleting, setDeleting] = useState<string | null>(null);

  if (!user) return <Navigate to="/login" />;

  const myListings = listings.filter((l) => l.ownerId === user.id);
  const totalViews = myListings.reduce((s, l) => s + l.views, 0);
  const totalContacts = myListings.reduce((s, l) => s + l.contactsRevealed, 0);

  const stats = [
    { icon: Eye, label: "Visualizacoes", value: totalViews },
    { icon: Users, label: "Contatos Revelados", value: totalContacts },
  ];

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este anuncio?")) return;
    setDeleting(id);
    await supabase.from("listings").delete().eq("id", id);
    updateListing(id, { status: "expired" });
    setDeleting(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold">Ola, {user.name}!</h1>
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
          {myListings.filter(l => l.status !== "expired").map((l) => (
            <div key={l.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={l.images[0]} alt={l.title} className="h-16 w-16 rounded-md object-cover" />
                <div>
                  <p className="font-heading font-semibold">{l.title}</p>
                  <p className="text-sm text-muted-foreground">{l.category} — R$ {l.price}/{l.priceUnit}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.status === "active" ? "bg-primary/10 text-primary" : "bg-accent/20 text-accent-foreground"}`}>
                    {l.status === "active" ? "Ativo" : "Pendente"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/editar-anuncio/${l.id}`}>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Pencil className="h-3 w-3" /> Editar
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(l.id)}
                  disabled={deleting === l.id}
                >
                  <Trash2 className="h-3 w-3" /> {deleting === l.id ? "..." : "Excluir"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useApp } from "@/contexts/AppContext";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Eye, Users, Plus } from "lucide-react";

export default function Dashboard() {
  const { user, listings } = useApp();
  if (!user) return <Navigate to="/login" />;

  const myListings = listings.filter((l) => l.ownerId === user.id);
  const totalViews = myListings.reduce((s, l) => s + l.views, 0);
  const totalContacts = myListings.reduce((s, l) => s + l.contactsRevealed, 0);

  const stats = [
    { icon: Eye, label: "Visualizações", value: totalViews },
    { icon: Users, label: "Contatos Revelados", value: totalContacts },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold">Olá, {user.name}!</h1>
          <p className="text-muted-foreground text-sm">Gerencie seus anúncios e acompanhe seus resultados.</p>
        </div>
        <Link to="/criar-anuncio">
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
            <Plus className="h-4 w-4 mr-2" /> Criar Anúncio
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 mb-10">
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

      <h2 className="text-xl font-heading font-bold mb-4">Meus Anúncios</h2>
      {myListings.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-4">Você ainda não tem anúncios.</p>
          <Link to="/criar-anuncio">
            <Button className="bg-primary text-primary-foreground hover:bg-primary-medium">Criar primeiro anúncio</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myListings.map((l) => (
            <div key={l.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={l.images[0]} alt={l.title} className="h-16 w-16 rounded-md object-cover" />
                <div>
                  <p className="font-heading font-semibold">{l.title}</p>
                  <p className="text-sm text-muted-foreground">{l.category} — R$ {l.price}/{l.priceUnit}</p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${l.status === "active" ? "bg-primary/10 text-primary" : l.status === "expired" ? "bg-destructive/10 text-destructive" : "bg-accent/20 text-accent-foreground"}`}>
                {l.status === "active" ? "Ativo" : l.status === "expired" ? "Expirado" : "Pendente"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

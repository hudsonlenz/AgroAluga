import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Tractor, Wheat, Droplets, Truck, Wrench, Sprout, Users, BarChart3, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp, CATEGORIES } from "@/contexts/AppContext";
import ListingCard from "@/components/ListingCard";
import { supabase } from "@/lib/supabase";

const CATEGORY_ICONS: any[] = [
  Tractor, Wheat, Sprout, Droplets, Truck, Wrench,
  Droplets, Users, BarChart3, Tractor, Wheat, Sprout,
  Droplets, Truck, Wrench, Droplets, Users, BarChart3,
  Tractor, Wheat, Sprout, Droplets, Truck, Wrench, Droplets,
];

export default function Index() {
  const { listings } = useApp();
  const navigate = useNavigate();
  const [searchService, setSearchService] = useState("");
  const [searchCity, setSearchCity] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("type=signup")) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) navigate("/redefinir-senha");
      });
    }
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (searchService) params.set("q", searchService);
    if (searchCity) params.set("city", searchCity);
    navigate(`/busca?${params.toString()}`);
  };

  const activeListings = listings.filter((l) => l.status === "active");

  const filtered = activeCategory === "Todos"
    ? activeListings
    : activeListings.filter((l) => l.category === activeCategory);

  const displayed = filtered.slice(0, 12);
  const featuredCount = activeListings.length;

  return (
    <div className="bg-background min-h-screen">

      {/* Hero compacto */}
      <section className="bg-primary py-10 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-primary-foreground mb-2">
            Equipamentos e servicos agricolas perto de voce
          </h1>
          <p className="text-primary-foreground/70 text-sm mb-6">
            {featuredCount > 0 ? `${featuredCount} anuncios disponiveis` : "Encontre o que precisa na sua regiao"}
          </p>
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
            <Input
              placeholder="O que voce precisa?"
              className="bg-card text-card-foreground border-0 h-11 flex-1"
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
            />
            <Input
              placeholder="Cidade ou regiao..."
              className="bg-card text-card-foreground border-0 h-11 flex-1"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
            <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 h-11 px-6 font-semibold shrink-0">
              <Search className="h-4 w-4 mr-2" /> Buscar
            </Button>
          </form>
        </div>
      </section>

      {/* Filtros de categoria */}
      <section className="bg-card border-b border-border sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            <button
              onClick={() => setActiveCategory("Todos")}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === "Todos"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              Todos
            </button>
            {CATEGORIES.map((cat, i) => {
              const Icon = CATEGORY_ICONS[i];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid de anuncios */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {filtered.length > 0
                ? `${filtered.length} anuncio${filtered.length > 1 ? "s" : ""} encontrado${filtered.length > 1 ? "s" : ""}`
                : "Nenhum anuncio encontrado"}
              {activeCategory !== "Todos" && ` em ${activeCategory}`}
            </p>
            <Link to="/busca">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filtros avancados
              </Button>
            </Link>
          </div>

          {displayed.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {displayed.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
              {filtered.length > 12 && (
                <div className="text-center mt-10">
                  <Link to={activeCategory === "Todos" ? "/busca" : `/busca?category=${encodeURIComponent(activeCategory)}`}>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8">
                      Ver todos os {filtered.length} anuncios
                    </Button>
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <Tractor className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium mb-2">Nenhum anuncio nessa categoria ainda</p>
              <p className="text-sm mb-6">Seja o primeiro a anunciar!</p>
              <Link to="/criar-anuncio">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                  + Criar anuncio
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA para anunciantes */}
      <section className="py-12 bg-primary/5 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-heading font-bold mb-2">Tem equipamentos ou presta servicos agricolas?</h2>
          <p className="text-muted-foreground text-sm mb-6">Anuncie gratuitamente e alcance produtores da sua regiao.</p>
          <Link to="/criar-anuncio">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8">
              + Anunciar gratuitamente
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}

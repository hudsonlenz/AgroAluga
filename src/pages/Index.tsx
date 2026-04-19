import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Tractor, Wheat, Droplets, Truck, Wrench, Sprout, Users, BarChart3, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp, CATEGORIES } from "@/contexts/AppContext";
import ListingCard from "@/components/ListingCard";
import heroBg from "@/assets/hero-bg.jpg";

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
  const featured = listings.filter((l) => l.featured).slice(0, 9);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchService) params.set("q", searchService);
    if (searchCity) params.set("city", searchCity);
    navigate(`/busca?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[540px] flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="Campo agrícola brasileiro" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold text-primary-foreground leading-tight mb-4">
            Alugue equipamentos agrícolas de produtores da sua região
          </h1>
          <p className="text-lg text-primary-foreground/80 mb-8">
            Alugue o que precisa. Anuncie o que tem. O agronegocio mais conectado comeca aqui.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <Input
              placeholder="Tipo de serviço..."
              className="bg-card text-card-foreground border-0 h-12"
              value={searchService}
              onChange={(e) => setSearchService(e.target.value)}
            />
            <Input
              placeholder="Cidade ou região..."
              className="bg-card text-card-foreground border-0 h-12"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-8 font-semibold" onClick={handleSearch}>
              <Search className="h-5 w-5 mr-2" /> Buscar
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-card border-b border-border">
        <div className="container mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          {[
            { value: "2.500+", label: "Equipamentos" },
            { value: "1.200+", label: "Produtores" },
            { value: "850+", label: "Cidades" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-heading font-extrabold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">Como Funciona</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-heading font-bold text-primary mb-6">Para quem contrata</h3>
              <div className="space-y-6">
                {[
                  { n: "1", t: "Busque", d: "Encontre serviços e equipamentos na sua região" },
                  { n: "2", t: "Compare", d: "Veja avaliações, preços e disponibilidade" },
                  { n: "3", t: "Contrate", d: "Libere o contato do fornecedor e feche o negócio" },
                ].map((s) => (
                  <div key={s.n} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-heading font-bold shrink-0">
                      {s.n}
                    </div>
                    <div>
                      <p className="font-heading font-semibold">{s.t}</p>
                      <p className="text-sm text-muted-foreground">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xl font-heading font-bold text-primary mb-6">Para quem anuncia</h3>
              <div className="space-y-6">
                {[
                  { n: "1", t: "Cadastre", d: "Crie sua conta e adicione seus serviços" },
                  { n: "2", t: "Publique", d: "Defina preço, disponibilidade e região de atendimento" },
                  { n: "3", t: "Receba clientes", d: "Produtores da região encontram seu anúncio" },
                ].map((s) => (
                  <div key={s.n} className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold shrink-0">
                      {s.n}
                    </div>
                    <div>
                      <p className="font-heading font-semibold">{s.t}</p>
                      <p className="text-sm text-muted-foreground">{s.d}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-10">Categorias de Serviço</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
            {CATEGORIES.map((cat, i) => {
              const Icon = CATEGORY_ICONS[i];
              return (
                <Link
                  key={cat}
                  to={`/busca?category=${encodeURIComponent(cat)}`}
                  className="flex flex-col items-center gap-2 p-4 bg-card rounded-lg hover:shadow-md transition-shadow text-center group"
                >
                  <Icon className="h-8 w-8 text-primary group-hover:text-accent transition-colors" />
                  <span className="text-xs font-medium leading-tight">{cat}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Destaque */}
      <section id="beneficios" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-10">Anúncios em Destaque</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/busca">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold px-8">
                Ver todos os anúncios
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

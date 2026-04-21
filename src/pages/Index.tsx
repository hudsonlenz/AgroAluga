import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, EQUIPMENT_CATEGORIES, SERVICE_CATEGORIES, Listing, CATEGORIES } from "@/contexts/AppContext";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Tractor, Wheat, Droplets, Truck, Wrench, Sprout, Users, BarChart3, SlidersHorizontal, MapPin, Loader2, Navigation, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCurrentPosition, reverseGeocode, geocodeCity, distanceKm } from "@/lib/geo";

const ITEMS_PER_PAGE = 12;
const ALL_CATEGORIES = [...EQUIPMENT_CATEGORIES, ...SERVICE_CATEGORIES];

const CATEGORY_ICONS: any[] = [
  Tractor, Wheat, Sprout, Droplets, Truck, Wrench,
  Droplets, Users, BarChart3, Tractor, Wheat, Sprout,
  Droplets, Truck, Wrench, Droplets, Users, BarChart3,
  Tractor, Wheat, Sprout, Droplets, Truck, Wrench, Droplets,
];

export default function Index() {
  const { listings } = useApp();
  const navigate = useNavigate();

  // Busca
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [listingType, setListingType] = useState<"all" | "equipamento" | "servico">("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Localização
  const [cityInput, setCityInput] = useState("");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [locating, setLocating] = useState(false);
  const [radiusKm, setRadiusKm] = useState(100);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("type=signup")) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) navigate("/redefinir-senha");
      });
    }
  }, []);

  const handleGPS = async () => {
    setLocating(true);
    const pos = await getCurrentPosition();
    if (pos) {
      setUserCoords(pos);
      const place = await reverseGeocode(pos.lat, pos.lng);
      if (place) { setCityInput(place.city); setLocationLabel(`${place.city}, ${place.state}`); }
      else setLocationLabel("Sua localizacao atual");
    } else {
      alert("Nao foi possivel obter sua localizacao.");
    }
    setLocating(false);
    setPage(1);
  };

  const handleCitySearch = async (city: string) => {
    if (!city.trim()) { setUserCoords(null); setLocationLabel(""); return; }
    setLocating(true);
    const coords = await geocodeCity(city, "");
    if (coords) { setUserCoords(coords); setLocationLabel(city); }
    setLocating(false);
    setPage(1);
  };

  const getDistance = (listing: Listing): number => {
    if (userCoords && listing.latitude && listing.longitude) {
      return distanceKm(userCoords.lat, userCoords.lng, listing.latitude, listing.longitude);
    }
    return 9999;
  };

  const filtered = useMemo(() => {
    let result = listings.filter((l) => l.status === "active");

    if (activeCategory !== "Todos") result = result.filter((l) => l.category === activeCategory);
    if (listingType !== "all") result = result.filter((l) => (l as any).listingType === listingType);
    if (priceRange === "low") result = result.filter((l) => l.price <= 100);
    else if (priceRange === "mid") result = result.filter((l) => l.price > 100 && l.price <= 200);
    else if (priceRange === "high") result = result.filter((l) => l.price > 200);
    if (searchQuery) result = result.filter((l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.city.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (userCoords) result = result.filter((l) => getDistance(l) <= radiusKm);

    if (sortBy === "distance") result = [...result].sort((a, b) => getDistance(a) - getDistance(b));
    else if (sortBy === "price") result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    else result = [...result].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return result;
  }, [listings, activeCategory, listingType, priceRange, sortBy, searchQuery, userCoords, radiusKm]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const clearFilters = () => {
    setActiveCategory("Todos");
    setListingType("all");
    setPriceRange("all");
    setSortBy("recent");
    setSearchQuery("");
    setUserCoords(null);
    setLocationLabel("");
    setCityInput("");
    setPage(1);
  };

  const hasActiveFilters = activeCategory !== "Todos" || listingType !== "all" || priceRange !== "all" || searchQuery || userCoords;

  return (
    <div className="bg-background min-h-screen">

      {/* Hero compacto com busca */}
      <section className="bg-primary py-8 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-xl md:text-2xl font-heading font-bold text-primary-foreground mb-2">
            Equipamentos e servicos agricolas perto de voce
          </h1>
          <p className="text-primary-foreground/70 text-sm mb-5">
          </p>
          <div className="flex gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="O que voce precisa?"
                className="bg-card text-card-foreground border-0 h-11 pl-9"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              />
            </div>
            <Button
              variant="outline"
              className="h-11 gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 shrink-0"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
              {hasActiveFilters && <span className="h-2 w-2 bg-accent rounded-full" />}
            </Button>
          </div>
        </div>
      </section>

      {/* Painel de filtros expansivel */}
      {showFilters && (
        <section className="bg-card border-b border-border shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Tipo */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo</label>
                <Select value={listingType} onValueChange={(v) => { setListingType(v as any); setPage(1); }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="equipamento">Equipamentos</SelectItem>
                    <SelectItem value="servico">Servicos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Preco */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Faixa de preco</label>
                <Select value={priceRange} onValueChange={(v) => { setPriceRange(v); setPage(1); }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="low">Ate R$ 100</SelectItem>
                    <SelectItem value="mid">R$ 100 - R$ 200</SelectItem>
                    <SelectItem value="high">Acima de R$ 200</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenacao */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Ordenar por</label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Mais recentes</SelectItem>
                    <SelectItem value="distance">Mais proximo</SelectItem>
                    <SelectItem value="price">Menor preco</SelectItem>
                    <SelectItem value="rating">Melhor avaliacao</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Localizacao */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Localizacao</label>
                <div className="flex gap-1">
                  <Input
                    placeholder="Sua cidade..."
                    className="h-9 text-sm flex-1"
                    value={cityInput}
                    onChange={(e) => setCityInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCitySearch(cityInput)}
                  />
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => handleCitySearch(cityInput)} disabled={locating}>
                    {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={handleGPS} disabled={locating}>
                    <Navigation className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {locationLabel && (
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {locationLabel}
                  </p>
                )}
              </div>
            </div>

            {userCoords && (
              <div className="mt-3 flex items-center gap-3">
                <label className="text-xs font-medium text-muted-foreground">Raio:</label>
                <Select value={String(radiusKm)} onValueChange={(v) => { setRadiusKm(Number(v)); setPage(1); }}>
                  <SelectTrigger className="h-8 text-xs w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["25", "50", "100", "200", "500"].map((r) => (
                      <SelectItem key={r} value={r}>{r} km</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-3 flex items-center gap-1 text-xs text-destructive hover:text-destructive/80">
                <X className="h-3 w-3" /> Limpar filtros
              </button>
            )}
          </div>
        </section>
      )}

      {/* Pills de categoria */}
      <section className="bg-card border-b border-border sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            <button
              onClick={() => { setActiveCategory("Todos"); setPage(1); }}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === "Todos" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
              }`}
            >
              Todos
            </button>
            {CATEGORIES.map((cat, i) => {
              const Icon = CATEGORY_ICONS[i];
              return (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setPage(1); }}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
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
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length} anuncio{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
              {activeCategory !== "Todos" && ` em ${activeCategory}`}
              {locationLabel && ` · ${radiusKm}km de ${locationLabel}`}
            </p>
          </div>

          {paginated.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Tractor className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium mb-2">Nenhum anuncio encontrado</p>
              <p className="text-sm mb-4">Tente ajustar os filtros ou buscar em outra regiao.</p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" /> Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {paginated.map((l) => <ListingCard key={l.id} listing={l} />)}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm"
                      className={page === i + 1 ? "bg-primary text-primary-foreground" : ""}
                      onClick={() => { setPage(i + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                      {i + 1}
                    </Button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA anunciantes */}
      <section className="py-10 bg-primary/5 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl font-heading font-bold mb-2">Tem equipamentos ou presta servicos agricolas?</h2>
          <p className="text-muted-foreground text-sm mb-5">Anuncie gratuitamente e alcance produtores da sua regiao.</p>
          <Button onClick={() => navigate("/criar-anuncio")} className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8">
            + Anunciar gratuitamente
          </Button>
        </div>
      </section>
    </div>
  );
}

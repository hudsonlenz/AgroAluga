import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, EQUIPMENT_CATEGORIES, SERVICE_CATEGORIES, Listing, CATEGORIES } from "@/contexts/AppContext";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Tractor, Wrench, MapPin, Loader2, Navigation, X, LayoutGrid } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCurrentPosition, reverseGeocode, geocodeCity, distanceKm } from "@/lib/geo";

const ITEMS_PER_PAGE = 12;
const ALL_CATEGORIES = [...EQUIPMENT_CATEGORIES, ...SERVICE_CATEGORIES];

export default function Index() {
  const { listings } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [page, setPage] = useState(1);
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

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSearchActive(searchQuery);
    setPage(1);
  };

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
    if (activeType !== "all") result = result.filter((l) => (l as any).listingType === activeType);
    if (category !== "all") result = result.filter((l) => l.category === category);
    if (priceRange === "low") result = result.filter((l) => l.price <= 100);
    else if (priceRange === "mid") result = result.filter((l) => l.price > 100 && l.price <= 200);
    else if (priceRange === "high") result = result.filter((l) => l.price > 200);
    if (searchActive) result = result.filter((l) =>
      l.title.toLowerCase().includes(searchActive.toLowerCase()) ||
      l.category.toLowerCase().includes(searchActive.toLowerCase()) ||
      l.city.toLowerCase().includes(searchActive.toLowerCase())
    );
    if (userCoords) result = result.filter((l) => getDistance(l) <= radiusKm);
    if (sortBy === "distance") result = [...result].sort((a, b) => getDistance(a) - getDistance(b));
    else if (sortBy === "price") result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === "rating") result = [...result].sort((a, b) => b.rating - a.rating);
    else result = [...result].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return result;
  }, [listings, activeType, category, priceRange, sortBy, searchActive, userCoords, radiusKm]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const hasActiveFilters = activeType !== "all" || category !== "all" || priceRange !== "all" || searchActive || userCoords;

  const clearFilters = () => {
    setActiveType("all"); setCategory("all"); setPriceRange("all");
    setSortBy("recent"); setSearchQuery(""); setSearchActive("");
    setUserCoords(null); setLocationLabel(""); setCityInput(""); setPage(1);
  };

  const categoriesForType = activeType === "equipamento"
    ? EQUIPMENT_CATEGORIES
    : activeType === "servico"
    ? SERVICE_CATEGORIES
    : ALL_CATEGORIES;

  return (
    <div className="bg-background min-h-screen">

      {/* Hero */}
      <section className="bg-primary py-8 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-xl md:text-2xl font-heading font-bold text-primary-foreground mb-5">
            Equipamentos e servicos agricolas perto de voce
          </h1>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="O que voce precisa?"
                className="bg-card text-card-foreground border-0 h-11 pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit" className="h-11 px-6 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold shrink-0">
              <Search className="h-4 w-4 mr-2" /> Buscar
            </Button>
          </form>
        </div>
      </section>

      {/* Filtros sempre visiveis */}
      <section className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

            {/* Categoria (dropdown) */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Categoria</label>
              <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categoriesForType.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
            <div className="md:col-span-2">
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
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={handleGPS} disabled={locating} title="Usar minha localizacao">
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

      {/* Pills: Todos / Equipamentos / Servicos */}
      <section className="bg-card border-b border-border sticky top-16 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-3">
            {[
              { value: "all", label: "Todos", icon: LayoutGrid },
              { value: "equipamento", label: "Equipamentos", icon: Tractor },
              { value: "servico", label: "Servicos", icon: Wrench },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => { setActiveType(value); setCategory("all"); setPage(1); }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeType === value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de anuncios */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {filtered.length} anuncio{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
              {category !== "all" && ` em ${category}`}
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

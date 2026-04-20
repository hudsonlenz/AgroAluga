import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp, EQUIPMENT_CATEGORIES, SERVICE_CATEGORIES, Listing } from "@/contexts/AppContext";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { SlidersHorizontal, MapPin, Loader2, Navigation, Tractor, Wrench } from "lucide-react";
import { getCurrentPosition, reverseGeocode, geocodeCity, distanceKm } from "@/lib/geo";

const ITEMS_PER_PAGE = 9;
const ALL_CATEGORIES = [...EQUIPMENT_CATEGORIES, ...SERVICE_CATEGORIES];

export default function SearchPage() {
  const { listings } = useApp();
  const [params] = useSearchParams();
  const [listingType, setListingType] = useState<"all" | "equipamento" | "servico">(
    params.get("type") as any || "all"
  );
  const [category, setCategory] = useState(params.get("category") || "all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("distance");
  const [page, setPage] = useState(1);
  const [radiusKm, setRadiusKm] = useState(100);
  const [cityInput, setCityInput] = useState(params.get("city") || "");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [locating, setLocating] = useState(false);

  const query = (params.get("q") || "").toLowerCase();

  const categories = listingType === "equipamento"
    ? EQUIPMENT_CATEGORIES
    : listingType === "servico"
    ? SERVICE_CATEGORIES
    : ALL_CATEGORIES;

  useEffect(() => {
    if (params.get("city")) handleCitySearch(params.get("city")!);
  }, []);

  const handleGPS = async () => {
    setLocating(true);
    const pos = await getCurrentPosition();
    if (pos) {
      setUserCoords(pos);
      const place = await reverseGeocode(pos.lat, pos.lng);
      if (place) {
        setCityInput(place.city);
        setLocationLabel(`${place.city}, ${place.state}`);
      } else {
        setLocationLabel("Sua localização atual");
      }
    } else {
      alert("Não foi possível obter sua localização.");
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

    if (listingType !== "all") result = result.filter((l) => (l as any).listingType === listingType);
    if (category !== "all") result = result.filter((l) => l.category === category);
    if (priceRange === "low") result = result.filter((l) => l.price <= 100);
    else if (priceRange === "mid") result = result.filter((l) => l.price > 100 && l.price <= 200);
    else if (priceRange === "high") result = result.filter((l) => l.price > 200);
    if (query) result = result.filter((l) =>
      l.title.toLowerCase().includes(query) || l.category.toLowerCase().includes(query)
    );
    if (userCoords) result = result.filter((l) => getDistance(l) <= radiusKm);

    if (sortBy === "distance") result = [...result].sort((a, b) => getDistance(a) - getDistance(b));
    else if (sortBy === "price") result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === "rating") result = [...result].sort((a, b) => b.rating - a.rating);

    return result;
  }, [listings, listingType, category, priceRange, sortBy, query, userCoords, radiusKm]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-heading font-bold mb-4">Buscar Equipamentos e Servicos</h1>

      {/* Filtro de tipo — abas principais */}
      <div className="flex gap-3 mb-6">
        {[
          { value: "all", label: "Todos", icon: null },
          { value: "equipamento", label: "Equipamentos", icon: Tractor },
          { value: "servico", label: "Servicos", icon: Wrench },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => { setListingType(t.value as any); setCategory("all"); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
              listingType === t.value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-primary/50 text-muted-foreground"
            }`}
          >
            {t.icon && <t.icon className="h-4 w-4" />}
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0 space-y-5">
          <div className="flex items-center gap-2 font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            <SlidersHorizontal className="h-4 w-4" /> Filtros
          </div>

          {/* Localização */}
          <div>
            <label className="text-sm font-medium mb-1 block">Localização</label>
            <div className="flex gap-2 mb-2">
              <Input placeholder="Digite sua cidade" value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCitySearch(cityInput)}
                className="flex-1" />
              <Button variant="outline" size="icon" onClick={() => handleCitySearch(cityInput)} disabled={locating}>
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" size="sm" className="w-full gap-2 text-xs" onClick={handleGPS} disabled={locating}>
              {locating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Navigation className="h-3 w-3" />}
              {locating ? "Localizando..." : "Usar minha localização"}
            </Button>
            {locationLabel && (
              <p className="text-xs text-primary mt-1 flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {locationLabel}
              </p>
            )}
          </div>

          {userCoords && (
            <div>
              <label className="text-sm font-medium mb-1 block">Raio de busca</label>
              <Select value={String(radiusKm)} onValueChange={(v) => { setRadiusKm(Number(v)); setPage(1); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["25", "50", "100", "200", "500"].map((r) => (
                    <SelectItem key={r} value={r}>{r} km</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Categoria */}
          <div>
            <label className="text-sm font-medium mb-1 block">Categoria</label>
            <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Preço */}
          <div>
            <label className="text-sm font-medium mb-1 block">Faixa de preco</label>
            <Select value={priceRange} onValueChange={(v) => { setPriceRange(v); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Ate R$ 100</SelectItem>
                <SelectItem value="mid">R$ 100 – R$ 200</SelectItem>
                <SelectItem value="high">Acima de R$ 200</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ordenação */}
          <div>
            <label className="text-sm font-medium mb-1 block">Ordenar por</label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">Mais próximo</SelectItem>
                <SelectItem value="price">Menor preco</SelectItem>
                <SelectItem value="rating">Melhor avaliação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </aside>

        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-4">
            {filtered.length} resultado(s) encontrado(s)
            {locationLabel && <span className="ml-1">em um raio de <strong>{radiusKm} km</strong> de <strong>{locationLabel}</strong></span>}
          </p>

          {paginated.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              Nenhum resultado encontrado. Tente ajustar os filtros.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginated.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button key={i} variant={page === i + 1 ? "default" : "outline"} size="sm"
                  className={page === i + 1 ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => setPage(i + 1)}>
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

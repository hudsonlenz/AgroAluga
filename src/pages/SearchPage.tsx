import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useApp, CATEGORIES } from "@/contexts/AppContext";
import ListingCard from "@/components/ListingCard";
import LocationFilter, { LocationState } from "@/components/LocationFilter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";

const ITEMS_PER_PAGE = 9;

export default function SearchPage() {
  const { listings } = useApp();
  const [params] = useSearchParams();
  const [category, setCategory] = useState(params.get("category") || "all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("distance");
  const [page, setPage] = useState(1);
  const [location, setLocation] = useState<LocationState | null>(
    params.get("city") ? { label: params.get("city")!, city: params.get("city")!, radiusKm: 100 } : null
  );

  const query = (params.get("q") || "").toLowerCase();

  const filtered = useMemo(() => {
    let result = listings.filter((l) => l.status === "active");

    if (category !== "all") result = result.filter((l) => l.category === category);

    // Filtro de localização: filtra por cidade e respeita o raio usando o campo distance dos listings
    if (location) {
      const cityLower = location.city.toLowerCase();
      result = result.filter(
        (l) =>
          l.city.toLowerCase().includes(cityLower) ||
          l.distance <= location.radiusKm
      );
    }

    if (priceRange === "low") result = result.filter((l) => l.price <= 100);
    else if (priceRange === "mid") result = result.filter((l) => l.price > 100 && l.price <= 200);
    else if (priceRange === "high") result = result.filter((l) => l.price > 200);

    if (query) result = result.filter((l) =>
      l.title.toLowerCase().includes(query) || l.category.toLowerCase().includes(query)
    );

    if (sortBy === "distance") result.sort((a, b) => a.distance - b.distance);
    else if (sortBy === "price") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "rating") result.sort((a, b) => b.rating - a.rating);

    return result;
  }, [listings, category, location, priceRange, sortBy, query]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-heading font-bold mb-6">Buscar Equipamentos e Serviços</h1>
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Filters */}
        <aside className="lg:w-64 shrink-0 space-y-5">
          <div className="flex items-center gap-2 font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            <SlidersHorizontal className="h-4 w-4" /> Filtros
          </div>

          {/* Localização */}
          <LocationFilter
            value={location}
            onChange={(loc) => { setLocation(loc); setPage(1); }}
          />

          {/* Categoria */}
          <div>
            <label className="text-sm font-medium mb-1 block">Categoria</label>
            <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Preço */}
          <div>
            <label className="text-sm font-medium mb-1 block">Faixa de preço</label>
            <Select value={priceRange} onValueChange={(v) => { setPriceRange(v); setPage(1); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="low">Até R$ 100</SelectItem>
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
                <SelectItem value="price">Menor preço</SelectItem>
                <SelectItem value="rating">Melhor avaliação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-4">
            {filtered.length} resultado(s) encontrado(s)
            {location && <span className="ml-1">em um raio de <strong>{location.radiusKm} km</strong> de <strong>{location.label}</strong></span>}
          </p>

          {paginated.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              Nenhum resultado encontrado. Tente ajustar os filtros ou aumentar o raio de busca.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginated.map((l) => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="sm"
                  className={page === i + 1 ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => setPage(i + 1)}
                >
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

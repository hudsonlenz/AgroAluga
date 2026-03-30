import { useState } from "react";
import { MapPin, Navigation, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface LocationState {
  label: string;       // texto exibido ex: "Ribeirão Preto, SP" ou "CEP 14010-000"
  city: string;        // para filtrar nos listings
  radiusKm: number;
}

interface Props {
  value: LocationState | null;
  onChange: (loc: LocationState | null) => void;
}

// Consulta ViaCEP (gratuita, sem autenticação)
async function fetchCep(cep: string): Promise<{ city: string; state: string } | null> {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
    const data = await res.json();
    if (data.erro) return null;
    return { city: data.localidade, state: data.uf };
  } catch {
    return null;
  }
}

// Consulta nominatim (OpenStreetMap) para reverso GPS
async function fetchReverseGeo(lat: number, lon: number): Promise<{ city: string; state: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=pt-BR`
    );
    const data = await res.json();
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      "";
    const state = data.address?.state || "";
    return city ? { city, state } : null;
  } catch {
    return null;
  }
}

export default function LocationFilter({ value, onChange }: Props) {
  const [mode, setMode] = useState<"cep" | "cidade" | "gps">("cidade");
  const [cepInput, setCepInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGPS = () => {
    if (!navigator.geolocation) {
      setError("Geolocalização não suportada neste navegador.");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const geo = await fetchReverseGeo(pos.coords.latitude, pos.coords.longitude);
        setLoading(false);
        if (geo) {
          onChange({
            label: `${geo.city}, ${geo.state} (GPS)`,
            city: geo.city,
            radiusKm: value?.radiusKm ?? 50,
          });
        } else {
          setError("Não foi possível identificar sua cidade.");
        }
      },
      () => {
        setLoading(false);
        setError("Permissão de localização negada.");
      },
      { timeout: 8000 }
    );
  };

  const handleCep = async () => {
    setError("");
    setLoading(true);
    const result = await fetchCep(cepInput);
    setLoading(false);
    if (result) {
      onChange({
        label: `CEP ${cepInput} — ${result.city}, ${result.state}`,
        city: result.city,
        radiusKm: value?.radiusKm ?? 50,
      });
    } else {
      setError("CEP não encontrado. Verifique e tente novamente.");
    }
  };

  const handleCity = () => {
    if (!cityInput.trim()) return;
    onChange({
      label: cityInput.trim(),
      city: cityInput.trim(),
      radiusKm: value?.radiusKm ?? 50,
    });
  };

  const handleRadiusChange = (r: string) => {
    if (value) onChange({ ...value, radiusKm: parseInt(r) });
  };

  const clear = () => {
    onChange(null);
    setCepInput("");
    setCityInput("");
    setError("");
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium block">Localização</label>

      {/* Localização ativa */}
      {value && (
        <div className="flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-lg px-3 py-2 text-sm">
          <MapPin className="h-4 w-4 text-accent shrink-0" />
          <span className="flex-1 font-medium truncate">{value.label}</span>
          <button onClick={clear} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabs de modo */}
      <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium">
        {(["cidade", "cep", "gps"] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setError(""); }}
            className={`flex-1 py-2 transition-colors ${
              mode === m
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-secondary"
            }`}
          >
            {m === "cidade" ? "Cidade" : m === "cep" ? "CEP" : "GPS"}
          </button>
        ))}
      </div>

      {/* Input por cidade */}
      {mode === "cidade" && (
        <div className="flex gap-2">
          <Input
            placeholder="Ex: Ribeirão Preto"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCity()}
            className="h-9 text-sm"
          />
          <Button size="sm" onClick={handleCity} className="bg-primary text-primary-foreground px-3 shrink-0">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input por CEP */}
      {mode === "cep" && (
        <div className="flex gap-2">
          <Input
            placeholder="00000-000"
            value={cepInput}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 8);
              setCepInput(v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleCep()}
            className="h-9 text-sm"
          />
          <Button size="sm" onClick={handleCep} disabled={loading} className="bg-primary text-primary-foreground px-3 shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      )}

      {/* GPS */}
      {mode === "gps" && (
        <Button
          variant="outline"
          className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground h-9 text-sm"
          onClick={handleGPS}
          disabled={loading}
        >
          {loading
            ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Detectando...</>
            : <><Navigation className="h-4 w-4 mr-2" /> Usar minha localização</>
          }
        </Button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}

      {/* Raio — só aparece quando há localização */}
      {value && (
        <div>
          <label className="text-sm font-medium mb-1 block">Raio de busca</label>
          <Select value={String(value.radiusKm)} onValueChange={handleRadiusChange}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 km</SelectItem>
              <SelectItem value="25">25 km</SelectItem>
              <SelectItem value="50">50 km</SelectItem>
              <SelectItem value="100">100 km</SelectItem>
              <SelectItem value="200">200 km</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

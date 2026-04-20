import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useApp, EQUIPMENT_CATEGORIES, SERVICE_CATEGORIES } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { geocodeCity } from "@/lib/geo";
import { ImagePlus, X, MapPin, Tractor, Wrench } from "lucide-react";

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];
const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function CreateListing() {
  const { user, addListing } = useApp();
  const navigate = useNavigate();

  const [listingType, setListingType] = useState<"equipamento" | "servico">("equipamento");
  const [form, setForm] = useState({
    title: "", category: "", description: "", price: "", priceUnit: "por hora",
    phone: "", whatsapp: "", email: "",
    city: user?.city || "", state: user?.state || "",
    availability: ["Seg", "Ter", "Qua", "Qui", "Sex"] as string[],
  });
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user) return <Navigate to="/login" />;
  if (user.blocked) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <div className="max-w-md mx-auto bg-destructive/10 border border-destructive/20 rounded-lg p-8">
        <h2 className="text-xl font-heading font-bold text-destructive mb-2">Conta bloqueada</h2>
        <p className="text-muted-foreground">Sua conta foi bloqueada e nao pode criar novos anuncios. Entre em contato com o suporte: agroaluga@outlook.com</p>
      </div>
    </div>
  );

  const categories = listingType === "equipamento" ? EQUIPMENT_CATEGORIES : SERVICE_CATEGORIES;

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const toggleDay = (d: string) => setForm((p) => ({
    ...p,
    availability: p.availability.includes(d)
      ? p.availability.filter((x) => x !== d)
      : [...p.availability, d],
  }));

  const handleTypeChange = (type: "equipamento" | "servico") => {
    setListingType(type);
    setForm((p) => ({ ...p, category: "" })); // resetar categoria ao trocar tipo
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("listings").upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from("listings").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }
    }
    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  const removeImage = (url: string) => setImages((prev) => prev.filter((i) => i !== url));

  const handlePublish = async () => {
    if (!form.title || !form.category || !form.description || !form.price || !form.city || !form.state) {
      setError("Preencha todos os campos obrigatorios."); return;
    }
    setError("");
    setLoading(true);
    try {
      const coords = await geocodeCity(form.city, form.state);
      const finalImages = images.length > 0
        ? images
        : ["https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop"];

      await addListing({
        title: form.title,
        category: form.category,
        description: form.description,
        price: parseFloat(form.price),
        priceUnit: form.priceUnit,
        city: form.city,
        state: form.state,
        latitude: coords?.lat,
        longitude: coords?.lng,
        images: finalImages,
        availability: form.availability,
        phone: form.phone,
        whatsapp: form.whatsapp,
        email: form.email,
        ownerId: user.id,
        ownerName: user.name,
        featured: false,
        status: "pending",
        listingType,
      } as any);
      navigate("/dashboard");
    } catch (e) {
      setError("Erro ao publicar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-heading font-bold mb-2">Criar Anuncio</h1>
      <p className="text-sm text-muted-foreground mb-6">Publicação gratuita — sem custo para anunciar.</p>

      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Tipo de anúncio */}
        <div>
          <label className="text-sm font-medium mb-2 block">Tipo de anuncio *</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange("equipamento")}
              className={`p-4 rounded-lg border text-left transition-all flex items-center gap-3 ${listingType === "equipamento" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
            >
              <Tractor className={`h-6 w-6 ${listingType === "equipamento" ? "text-primary" : "text-muted-foreground"}`} />
              <div>
                <p className={`font-semibold text-sm ${listingType === "equipamento" ? "text-primary" : ""}`}>Equipamento</p>
                <p className="text-xs text-muted-foreground">Maquinas e ferramentas</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("servico")}
              className={`p-4 rounded-lg border text-left transition-all flex items-center gap-3 ${listingType === "servico" ? "border-accent bg-accent/10" : "border-border hover:border-accent/50"}`}
            >
              <Wrench className={`h-6 w-6 ${listingType === "servico" ? "text-accent" : "text-muted-foreground"}`} />
              <div>
                <p className={`font-semibold text-sm ${listingType === "servico" ? "text-accent-foreground" : ""}`}>Servico</p>
                <p className="text-xs text-muted-foreground">Mao de obra e consultoria</p>
              </div>
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Titulo *</label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)}
            placeholder={listingType === "equipamento" ? "Ex: Trator New Holland — Indaial, SC" : "Ex: Mapeamento Aereo com Drone — Indaial, SC"} />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Categoria *</label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Descrição *</label>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4}
            placeholder={listingType === "equipamento" ? "Descreva o equipamento, estado de conservação, marca, modelo..." : "Descreva o servico, sua experiencia, área de atuação..."} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Preco *</label>
            <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="150" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Unidade</label>
            <Select value={form.priceUnit} onValueChange={(v) => set("priceUnit", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["por hora", "por hectare", "por km", "por diaria", "por tarefa", "a combinar"].map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block flex items-center gap-1">
            <MapPin className="h-3 w-3" /> Localização *
          </label>
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Cidade *" value={form.city} onChange={(e) => set("city", e.target.value)} className="col-span-2" />
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.state} onChange={(e) => set("state", e.target.value)}>
              <option value="">UF *</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Fotos</label>
          <div className="flex flex-wrap gap-3">
            {images.map((url) => (
              <div key={url} className="relative h-24 w-24 rounded-lg overflow-hidden border border-border">
                <img src={url} alt="preview" className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeImage(url)}
                  className="absolute top-1 right-1 h-5 w-5 bg-destructive rounded-full flex items-center justify-center">
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="h-24 w-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-1">{uploading ? "Enviando..." : "Adicionar"}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Ate 5 fotos.</p>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Disponibilidade</label>
          <div className="flex gap-2 flex-wrap">
            {DAYS.map((d) => (
              <button key={d} type="button" onClick={() => toggleDay(d)}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${form.availability.includes(d) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-primary/10"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input placeholder="Telefone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <Input placeholder="WhatsApp" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} />
          <Input placeholder="E-mail" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>

        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-12 text-base"
          onClick={handlePublish} disabled={loading || uploading}>
          {loading ? "Publicando..." : "Publicar gratuitamente"}
        </Button>
      </div>
    </div>
  );
}

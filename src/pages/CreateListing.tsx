import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useApp, CATEGORIES } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function CreateListing() {
  const { user, addListing } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", category: "", description: "", price: "", priceUnit: "por hora",
    radius: "50", phone: "", whatsapp: "", email: "",
    availability: ["Seg", "Ter", "Qua", "Qui", "Sex"] as string[],
  });
  const [error, setError] = useState("");

  if (!user) return <Navigate to="/login" />;

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const toggleDay = (d: string) => setForm((p) => ({
    ...p,
    availability: p.availability.includes(d)
      ? p.availability.filter((x) => x !== d)
      : [...p.availability, d],
  }));

  const handlePublish = () => {
    if (!form.title || !form.category || !form.description || !form.price) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    setError("");
    addListing({
      title: form.title,
      category: form.category,
      description: form.description,
      price: parseFloat(form.price),
      priceUnit: form.priceUnit,
      city: user.city,
      state: user.state,
      distance: 0,
      rating: 0,
      reviewCount: 0,
      images: ["https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop"],
      availability: form.availability,
      phone: form.phone || user.phone,
      whatsapp: form.whatsapp || user.phone,
      email: form.email || user.email,
      ownerId: user.id,
      ownerName: user.name,
      featured: false,
      status: "active",
    });
    navigate("/dashboard");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-heading font-bold mb-2">Criar Anúncio</h1>
      <p className="text-sm text-muted-foreground mb-6">Publicação gratuita — sem custo para anunciar.</p>
      <div className="bg-card border border-border rounded-lg p-6 space-y-5">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div>
          <label className="text-sm font-medium mb-1 block">Título do serviço *</label>
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Ex: Aluguel de Trator — Ribeirão Preto" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Categoria *</label>
          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Descrição *</label>
          <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="Descreva o serviço ou equipamento..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium mb-1 block">Preço *</label>
            <Input type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="150" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Unidade</label>
            <Select value={form.priceUnit} onValueChange={(v) => set("priceUnit", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["por hora", "por hectare", "por km", "por diária"].map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Raio de atendimento</label>
          <Select value={form.radius} onValueChange={(v) => set("radius", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["10", "25", "50", "100"].map((r) => <SelectItem key={r} value={r}>{r} km</SelectItem>)}
            </SelectContent>
          </Select>
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
        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-12 text-base" onClick={handlePublish}>
          Publicar gratuitamente
        </Button>
      </div>
    </div>
  );
}

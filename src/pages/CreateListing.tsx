import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useApp, CATEGORIES } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PaymentModal from "@/components/PaymentModal";
import { Check, Star, Zap } from "lucide-react";

const PLANS = [
  { id: "basic" as const, name: "Básico", price: "R$ 29,90/mês", desc: "1 anúncio sem destaque", icon: Check },
  { id: "professional" as const, name: "Profissional", price: "R$ 59,90/mês", desc: "3 anúncios com destaque na busca", icon: Star },
  { id: "premium" as const, name: "Premium", price: "R$ 99,90/mês", desc: "Anúncios ilimitados, topo da busca, selo verificado", icon: Zap },
];

const DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function CreateListing() {
  const { user, addListing } = useApp();
  const navigate = useNavigate();
  const [payOpen, setPayOpen] = useState(false);

  const [form, setForm] = useState({
    title: "", category: "", description: "", price: "", priceUnit: "por hora",
    radius: "50", phone: "", whatsapp: "", email: "",
    availability: ["Seg", "Ter", "Qua", "Qui", "Sex"] as string[],
    plan: "basic" as "basic" | "professional" | "premium",
  });
  const [error, setError] = useState("");

  if (!user) return <Navigate to="/login" />;

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const toggleDay = (d: string) => setForm((p) => ({ ...p, availability: p.availability.includes(d) ? p.availability.filter((x) => x !== d) : [...p.availability, d] }));

  const handlePublish = () => {
    if (!form.title || !form.category || !form.description || !form.price) { setError("Preencha todos os campos obrigatórios."); return; }
    setError("");
    setPayOpen(true);
  };

  const handlePaymentSuccess = () => {
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
      featured: form.plan !== "basic",
      status: "active",
    });
    navigate("/dashboard");
  };

  const selectedPlan = PLANS.find((p) => p.id === form.plan)!;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-heading font-bold mb-6">Criar Anúncio</h1>
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

        {/* Plans */}
        <div>
          <label className="text-sm font-medium mb-3 block">Plano de publicação</label>
          <div className="grid sm:grid-cols-3 gap-3">
            {PLANS.map((p) => (
              <button key={p.id} type="button" onClick={() => set("plan", p.id)}
                className={`p-4 rounded-lg border text-left transition-all ${form.plan === p.id ? "border-accent bg-accent/10 shadow-md" : "border-border hover:border-accent/50"}`}>
                <p.icon className={`h-5 w-5 mb-2 ${form.plan === p.id ? "text-accent" : "text-muted-foreground"}`} />
                <p className="font-heading font-semibold text-sm">{p.name}</p>
                <p className="text-accent font-bold text-sm">{p.price}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold h-12 text-base" onClick={handlePublish}>
          Publicar e Pagar
        </Button>
      </div>

      <PaymentModal
        open={payOpen}
        onClose={() => setPayOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={selectedPlan.price.replace("/mês", "")}
        description={`Plano ${selectedPlan.name}`}
      />
    </div>
  );
}

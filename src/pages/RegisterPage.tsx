import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tractor } from "lucide-react";

const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function RegisterPage() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", cpfCnpj: "", email: "", password: "", confirmPassword: "", phone: "", state: "", city: "", accountType: "" as "contractor" | "provider" | "", terms: false });
  const [error, setError] = useState("");

  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.phone || !form.state || !form.city || !form.accountType) { setError("Preencha todos os campos obrigatórios."); return; }
    if (form.password.length < 8) { setError("Senha deve ter no mínimo 8 caracteres."); return; }
    if (form.password !== form.confirmPassword) { setError("As senhas não coincidem."); return; }
    if (!form.terms) { setError("Aceite os termos de uso."); return; }
    register({ name: form.name, email: form.email, phone: form.phone, city: form.city, state: form.state, accountType: form.accountType as "contractor" | "provider" });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-card rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Tractor className="h-8 w-8 text-primary" />
          <span className="font-heading text-2xl font-bold text-primary">AgroAluga</span>
        </div>
        <h1 className="text-xl font-heading font-bold text-center mb-6">Criar sua conta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <Input placeholder="Nome completo *" value={form.name} onChange={(e) => set("name", e.target.value)} />
          <Input placeholder="CPF ou CNPJ" value={form.cpfCnpj} onChange={(e) => set("cpfCnpj", e.target.value)} />
          <Input type="email" placeholder="E-mail *" value={form.email} onChange={(e) => set("email", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input type="password" placeholder="Senha *" value={form.password} onChange={(e) => set("password", e.target.value)} />
            <Input type="password" placeholder="Confirmar senha *" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} />
          </div>
          <Input placeholder="Telefone *" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.state} onChange={(e) => set("state", e.target.value)}>
              <option value="">Estado *</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Input placeholder="Cidade *" value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Tipo de conta *</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { v: "contractor", l: "Quero contratar serviços" },
                { v: "provider", l: "Quero anunciar serviços" },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${form.accountType === o.v ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50"}`}
                  onClick={() => set("accountType", o.v)}
                >
                  {o.l}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.terms} onChange={(e) => set("terms", e.target.checked)} className="rounded" />
            Aceito os <span className="text-primary font-medium hover:underline cursor-pointer">termos de uso</span>
          </label>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary-medium font-semibold" type="submit">Cadastrar</Button>
          <p className="text-center text-sm text-muted-foreground">Já tem conta? <Link to="/login" className="text-primary font-medium hover:underline">Entrar</Link></p>
        </form>
      </div>
    </div>
  );
}

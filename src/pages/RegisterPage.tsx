import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tractor } from "lucide-react";
import TermosModal from "@/components/TermosModal";

const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function RegisterPage() {
  const { register, authLoading } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    phone: "", state: "", city: "", terms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [termosOpen, setTermosOpen] = useState(false);

  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.phone || !form.state || !form.city) {
      setError("Preencha todos os campos obrigatórios."); return;
    }
    if (form.password.length < 6) { setError("A senha deve ter no mínimo 6 caracteres."); return; }
    if (form.password !== form.confirmPassword) { setError("As senhas não coincidem."); return; }
    if (!form.terms) { setError("Voce precisa aceitar os termos de uso para continuar."); return; }

    setLoading(true);
    setError("");

    const err = await register({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
      city: form.city,
      state: form.state,
      accountType: "both" as any,
    });

    setLoading(false);
    if (err) { setError(err.message); } else { setSuccess(true); }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Tractor className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-heading font-bold mb-2">Conta criada!</h2>
          <p className="text-muted-foreground mb-6">
            Enviamos um e-mail de confirmacao para <strong>{form.email}</strong>.
            Confirme seu e-mail para ativar a conta.
          </p>
          <Link to="/login">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold w-full">
              Ir para o login
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-card rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Tractor className="h-8 w-8 text-primary" />
          <span className="font-heading text-2xl font-bold text-primary">AgroAluga</span>
        </div>
        <h1 className="text-xl font-heading font-bold text-center mb-2">Criar sua conta grátis</h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Com uma conta você pode contratar e anunciar serviços
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md">{error}</p>}
          <Input placeholder="Nome completo *" value={form.name} onChange={(e) => set("name", e.target.value)} disabled={loading} />
          <Input type="email" placeholder="E-mail *" value={form.email} onChange={(e) => set("email", e.target.value)} disabled={loading} />
          <div className="grid grid-cols-2 gap-3">
            <Input type="password" placeholder="Senha *" value={form.password} onChange={(e) => set("password", e.target.value)} disabled={loading} />
            <Input type="password" placeholder="Confirmar senha *" value={form.confirmPassword} onChange={(e) => set("confirmPassword", e.target.value)} disabled={loading} />
          </div>
          <Input placeholder="Telefone *" value={form.phone} onChange={(e) => set("phone", e.target.value)} disabled={loading} />
          <div className="grid grid-cols-2 gap-3">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.state} onChange={(e) => set("state", e.target.value)} disabled={loading}
            >
              <option value="">Estado *</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Input placeholder="Cidade *" value={form.city} onChange={(e) => set("city", e.target.value)} disabled={loading} />
          </div>

          {/* Termos de uso */}
          <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${form.terms ? "border-primary bg-primary/5" : "border-border"}`}>
            <input
              type="checkbox"
              checked={form.terms}
              onChange={(e) => {
                if (e.target.checked) {
                  setTermosOpen(true);
                } else {
                  set("terms", false);
                }
              }}
              className="mt-0.5 rounded"
              disabled={loading}
            />
            <p className="text-sm text-muted-foreground">
              Li e aceito os{" "}
              <button
                type="button"
                onClick={() => setTermosOpen(true)}
                className="text-primary font-medium hover:underline"
              >
                Termos de Uso
              </button>
              {" "}e a{" "}
              <Link to="/privacidade" target="_blank" className="text-primary font-medium hover:underline">
                Politica de Privacidade
              </Link>
            </p>
          </div>

          <Button
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            type="submit"
            disabled={loading}
          >
            {loading ? "Criando conta..." : "Criar conta grátis"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Entrar</Link>
          </p>
        </form>
      </div>

      <TermosModal
        open={termosOpen}
        onAccept={() => { set("terms", true); setTermosOpen(false); }}
        onClose={() => setTermosOpen(false)}
      />
    </div>
  );
}

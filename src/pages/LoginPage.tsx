import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tractor } from "lucide-react";

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Preencha todos os campos."); return; }
    if (password.length < 8) { setError("Senha deve ter no mínimo 8 caracteres."); return; }
    login(email, password);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Tractor className="h-8 w-8 text-primary" />
          <span className="font-heading text-2xl font-bold text-primary">AgroAluga</span>
        </div>
        <h1 className="text-xl font-heading font-bold text-center mb-6">Entrar na sua conta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <div>
            <label className="text-sm font-medium mb-1 block">E-mail</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Senha</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Sua senha" />
          </div>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary-medium font-semibold" type="submit">Entrar</Button>
          <div className="text-center text-sm space-y-1">
            <button type="button" className="text-accent hover:underline">Esqueci minha senha</button>
            <p className="text-muted-foreground">Não tem conta? <Link to="/cadastro" className="text-primary font-medium hover:underline">Cadastre-se</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
}

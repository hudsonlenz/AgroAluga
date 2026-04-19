import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tractor } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset password state
  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Preencha e-mail e senha."); return; }
    setLoading(true);
    setError("");
    const err = await login(email, password);
    setLoading(false);
    if (err) { setError(err.message); } else { navigate("/dashboard"); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) { setError("Digite seu e-mail."); return; }
    setResetLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: "https://agro-aluga.vercel.app/redefinir-senha",
    });
    setResetLoading(false);
    if (error) {
      setError("Erro ao enviar e-mail. Verifique o endereco informado.");
    } else {
      setResetSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Tractor className="h-8 w-8 text-primary" />
          <span className="font-heading text-2xl font-bold text-primary">AgroAluga</span>
        </div>

        {/* Modo redefinir senha */}
        {resetMode ? (
          <>
            <h1 className="text-xl font-heading font-bold text-center mb-2">Redefinir senha</h1>
            {resetSent ? (
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-700 text-sm font-medium">E-mail enviado!</p>
                  <p className="text-green-600 text-sm mt-1">
                    Verifique sua caixa de entrada em <strong>{resetEmail}</strong> e clique no link para redefinir sua senha.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setResetMode(false); setResetSent(false); setResetEmail(""); }}
                >
                  Voltar ao login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Digite seu e-mail e enviaremos um link para redefinir sua senha.
                </p>
                {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md">{error}</p>}
                <Input
                  type="email"
                  placeholder="Seu e-mail *"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={resetLoading}
                />
                <Button
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                  type="submit"
                  disabled={resetLoading}
                >
                  {resetLoading ? "Enviando..." : "Enviar link de redefinicao"}
                </Button>
                <button
                  type="button"
                  onClick={() => { setResetMode(false); setError(""); }}
                  className="w-full text-sm text-muted-foreground hover:text-primary transition-colors text-center"
                >
                  Voltar ao login
                </button>
              </form>
            )}
          </>
        ) : (
          /* Modo login normal */
          <>
            <h1 className="text-xl font-heading font-bold text-center mb-6">Entrar na sua conta</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md">{error}</p>}
              <Input
                type="email"
                placeholder="E-mail *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="Senha *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setResetMode(true); setError(""); setResetEmail(email); }}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                type="submit"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Nao tem conta?{" "}
                <Link to="/cadastro" className="text-primary font-medium hover:underline">
                  Cadastre-se gratuitamente
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

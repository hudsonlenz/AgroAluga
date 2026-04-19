import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tractor } from "lucide-react";

export default function RedefinirSenhaPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);

  useEffect(() => {
    // Verificar se há sessão de reset válida
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) { setError("Preencha todos os campos."); return; }
    if (password.length < 6) { setError("A senha deve ter no minimo 6 caracteres."); return; }
    if (password !== confirmPassword) { setError("As senhas nao coincidem."); return; }

    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError("Erro ao redefinir senha. Tente novamente.");
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 3000);
    }
  };

  if (!validSession) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8 text-center">
        <Tractor className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-heading font-bold mb-2">Link invalido</h2>
        <p className="text-muted-foreground mb-6">Este link de redefinicao expirou ou ja foi utilizado.</p>
        <Button className="bg-primary text-primary-foreground w-full" onClick={() => navigate("/login")}>
          Voltar ao login
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Tractor className="h-8 w-8 text-primary" />
          <span className="font-heading text-2xl font-bold text-primary">AgroAluga</span>
        </div>
        <h1 className="text-xl font-heading font-bold text-center mb-6">Redefinir senha</h1>

        {success ? (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 font-medium">Senha redefinida com sucesso!</p>
              <p className="text-green-600 text-sm mt-1">Redirecionando para o dashboard...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md">{error}</p>}
            <Input
              type="password"
              placeholder="Nova senha *"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Confirmar nova senha *"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
            />
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              type="submit"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

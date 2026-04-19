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
  const [validSession, setValidSession] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkSession() {
      // Debug — mostrar URL atual
      console.log("URL completa:", window.location.href);
      console.log("Hash:", window.location.hash);
      console.log("Search:", window.location.search);
      console.log("Pathname:", window.location.pathname);

      // Verificar sessão atual
      const { data: { session } } = await supabase.auth.getSession();
      console.log("Sessao atual:", session);
      if (session) {
        setValidSession(true);
        return;
      }

      // Tentar capturar token do hash da URL
      const fullHash = window.location.hash;
      const tokenMatch = fullHash.match(/access_token=([^&]+)/);
      const typeMatch = fullHash.match(/type=([^&]+)/);

      if (tokenMatch && typeMatch) {
        const accessToken = tokenMatch[1];
        const refreshMatch = fullHash.match(/refresh_token=([^&]+)/);
        const refreshToken = refreshMatch ? refreshMatch[1] : "";

        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error) {
          setValidSession(true);
          return;
        }
      }

      // Aguardar evento do Supabase
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          setValidSession(true);
          subscription.unsubscribe();
        }
      });

      // Timeout se nenhum evento chegar
      setTimeout(() => {
        setValidSession((prev) => prev === null ? false : prev);
        subscription.unsubscribe();
      }, 3000);
    }

    checkSession();
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
      await supabase.auth.signOut();
      setTimeout(() => navigate("/login"), 3000);
    }
  };

  if (validSession === null) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Verificando link...</p>
      </div>
    </div>
  );

  if (validSession === false) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-lg p-8 text-center">
        <Tractor className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-xl font-heading font-bold mb-2">Link invalido ou expirado</h2>
        <p className="text-muted-foreground mb-6">
          Solicite um novo link de redefinicao de senha.
        </p>
        <Button className="bg-primary text-primary-foreground w-full" onClick={() => navigate("/login")}>
          Solicitar novo link
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-700 font-medium">Senha redefinida com sucesso!</p>
            <p className="text-green-600 text-sm mt-1">Redirecionando para o login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive text-center bg-destructive/10 p-3 rounded-md">{error}</p>}
            <Input type="password" placeholder="Nova senha *" value={password}
              onChange={(e) => setPassword(e.target.value)} disabled={loading} />
            <Input type="password" placeholder="Confirmar nova senha *" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} disabled={loading} />
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

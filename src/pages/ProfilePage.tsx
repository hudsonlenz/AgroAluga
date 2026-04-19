import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, User } from "lucide-react";

const STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

export default function ProfilePage() {
  const { user, setUser, authLoading } = useApp();
  const [form, setForm] = useState({ name: "", phone: "", city: "", state: "" });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    loadProfile();
  }, [user]);

  async function loadProfile() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) {
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        city: data.city || "",
        state: data.state || "",
      });
      setAvatarUrl(data.avatar_url || null);
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(url);
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      // Atualizar nome nos anúncios existentes não é necessário pois o avatar é buscado pelo perfil
    }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.city || !form.state) {
      setError("Preencha todos os campos."); return;
    }
    setSaving(true);
    setError("");
    const { error } = await supabase
      .from("profiles")
      .update({
        name: form.name,
        phone: form.phone,
        city: form.city,
        state: form.state,
      })
      .eq("id", user.id);

    if (error) {
      setError("Erro ao salvar. Tente novamente.");
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-lg">
      <h1 className="text-2xl font-heading font-bold mb-6">Meu Perfil</h1>

      <div className="bg-card border border-border rounded-lg p-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 h-8 w-8 bg-accent rounded-full flex items-center justify-center cursor-pointer hover:bg-accent/90 transition-colors">
              <Camera className="h-4 w-4 text-accent-foreground" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>
          <p className="text-sm text-muted-foreground">
            {uploading ? "Enviando foto..." : "Clique na camera para alterar"}
          </p>
        </div>

        {/* Formulário */}
        {error && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</p>}
        {success && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md">Perfil atualizado com sucesso!</p>}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Nome completo *</label>
            <Input value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Telefone *</label>
            <Input value={form.phone} onChange={(e) => setForm(p => ({ ...p, phone: e.target.value }))} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">E-mail</label>
            <Input value={user.email} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground mt-1">O e-mail nao pode ser alterado</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              placeholder="Cidade *"
              value={form.city}
              onChange={(e) => setForm(p => ({ ...p, city: e.target.value }))}
              className="col-span-2"
            />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.state}
              onChange={(e) => setForm(p => ({ ...p, state: e.target.value }))}
            >
              <option value="">UF *</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Salvando..." : "Salvar alteracoes"}
        </Button>
      </div>
    </div>
  );
}

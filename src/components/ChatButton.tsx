import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface ChatButtonProps {
  listingId: string;
  sellerId: string;
}

export default function ChatButton({ listingId, sellerId }: ChatButtonProps) {
  const { user } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartChat = async () => {
    if (!user) { navigate("/login"); return; }
    if (user.id === sellerId) return;

    setLoading(true);

    // Verificar se já existe conversa
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", listingId)
      .eq("buyer_id", user.id)
      .single();

    if (existing) {
      navigate("/mensagens");
      return;
    }

    // Criar nova conversa
    const { error } = await supabase.from("conversations").insert({
      listing_id: listingId,
      buyer_id: user.id,
      seller_id: sellerId,
    });

    setLoading(false);
    if (!error) navigate("/mensagens");
  };

  if (user?.id === sellerId) return null;

  return (
    <Button
      variant="outline"
      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold gap-2"
      onClick={handleStartChat}
      disabled={loading}
    >
      <MessageCircle className="h-4 w-4" />
      {loading ? "Abrindo chat..." : "Enviar mensagem"}
    </Button>
  );
}

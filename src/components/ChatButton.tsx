import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface ChatButtonProps {
  listingId: string;
  sellerId: string;
}

export default function ChatButton({ listingId, sellerId }: ChatButtonProps) {
  const { user } = useApp();
  const navigate = useNavigate();

  const handleStartChat = () => {
    if (!user) { navigate("/login"); return; }
    if (user.id === sellerId) return;
    // Passa o listingId e sellerId como parâmetros na URL
    navigate(`/mensagens?listing=${listingId}&seller=${sellerId}`);
  };

  if (user?.id === sellerId) return null;

  return (
    <Button
      variant="outline"
      className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold gap-2"
      onClick={handleStartChat}
    >
      <MessageCircle className="h-4 w-4" />
      Enviar mensagem
    </Button>
  );
}

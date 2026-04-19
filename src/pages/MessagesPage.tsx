import { useState, useEffect, useRef } from "react";
import { Link, Navigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  listing?: { title: string; images: string[] };
  other_user?: { name: string };
  last_message?: Message;
  unread_count?: number;
}

export default function MessagesPage() {
  const { user } = useApp();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected.id);
    markAsRead(selected.id);

    // Realtime — escuta novas mensagens
    const channel = supabase
      .channel(`messages:${selected.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${selected.id}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchConversations() {
    setLoading(true);
    const { data } = await supabase
      .from("conversations")
      .select(`
        *,
        listing:listings(title, images),
        buyer:profiles!conversations_buyer_id_fkey(name),
        seller:profiles!conversations_seller_id_fkey(name)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (data) {
      const convs = data.map((c: any) => ({
        ...c,
        listing: c.listing,
        other_user: user.id === c.buyer_id ? c.seller : c.buyer,
      }));
      setConversations(convs);
      if (convs.length > 0 && !selected) setSelected(convs[0]);
    }
    setLoading(false);
  }

  async function fetchMessages(conversationId: string) {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
  }

  async function markAsRead(conversationId: string) {
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id);
  }

  async function sendMessage() {
    if (!input.trim() || !selected) return;
    const content = input.trim();
    setInput("");
    await supabase.from("messages").insert({
      conversation_id: selected.id,
      sender_id: user.id,
      content,
    });
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (loading) return (
    <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
      Carregando mensagens...
    </div>
  );

  if (conversations.length === 0) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground mb-4">Voce ainda nao tem conversas.</p>
      <Link to="/busca">
        <Button className="bg-primary text-primary-foreground">Buscar servicos</Button>
      </Link>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-heading font-bold mb-6">Mensagens</h1>
      <div className="grid md:grid-cols-3 gap-4 h-[600px]">

        {/* Lista de conversas */}
        <div className="border border-border rounded-lg overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border bg-secondary font-medium text-sm">
            Conversas ({conversations.length})
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelected(conv)}
                className={`w-full text-left p-3 border-b border-border hover:bg-secondary transition-colors ${selected?.id === conv.id ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={conv.listing?.images?.[0] || "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=60&h=60&fit=crop"}
                    alt=""
                    className="h-10 w-10 rounded-md object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{conv.other_user?.name || "Usuario"}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.listing?.title}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Área de chat */}
        <div className="md:col-span-2 border border-border rounded-lg overflow-hidden flex flex-col">
          {selected ? (
            <>
              {/* Header */}
              <div className="p-3 border-b border-border bg-secondary flex items-center gap-3">
                <img
                  src={selected.listing?.images?.[0] || "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=60&h=60&fit=crop"}
                  alt=""
                  className="h-8 w-8 rounded-md object-cover"
                />
                <div>
                  <p className="font-medium text-sm">{selected.other_user?.name}</p>
                  <Link to={`/anuncio/${selected.listing_id}`} className="text-xs text-primary hover:underline">
                    {selected.listing?.title}
                  </Link>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Nenhuma mensagem ainda. Inicie a conversa!
                  </p>
                )}
                {messages.map((msg) => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary rounded-bl-sm"}`}>
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {new Date(msg.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-border flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite uma mensagem..."
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!input.trim()} className="bg-primary text-primary-foreground">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Selecione uma conversa
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

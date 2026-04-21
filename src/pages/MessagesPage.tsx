import { useState, useEffect, useRef } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, ExternalLink } from "lucide-react";

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
}

export default function MessagesPage() {
  const { user, authLoading } = useApp();
  const [searchParams] = useSearchParams();
  const newListingId = searchParams.get("listing");
  const newSellerId = searchParams.get("seller");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [pendingNew, setPendingNew] = useState<{ listingId: string; sellerId: string } | null>(null);
  const [pendingListing, setPendingListing] = useState<{ title: string; images: string[] } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" />;

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected.id);
    markAsRead(selected.id);

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

      if (newListingId && newSellerId) {
        const existing = convs.find((c) => c.listing_id === newListingId && c.buyer_id === user.id);
        if (existing) {
          setSelected(existing);
          setPendingNew(null);
        } else {
          const { data: listingData } = await supabase
            .from("listings")
            .select("title, images")
            .eq("id", newListingId)
            .single();
          setPendingListing(listingData);
          setPendingNew({ listingId: newListingId, sellerId: newSellerId });
          setSelected(null);
        }
      } else if (convs.length > 0) {
        setSelected(convs[0]);
      }
    }
    setLoading(false);
  }

  async function fetchMessages(conversationId: string) {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (data) {
      setMessages(data);
      // Scroll para o fim apenas apos carregar as mensagens
      setTimeout(() => {
        if (messagesRef.current) {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
      }, 50);
    }
  }

  async function markAsRead(conversationId: string) {
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", user.id);
  }

  async function sendMessage() {
    if (!input.trim()) return;
    if (user?.blocked) {
      alert("Sua conta esta bloqueada e nao pode enviar mensagens.");
      return;
    }
    const content = input.trim();
    setInput("");

    if (pendingNew) {
      const { data: conv, error } = await supabase
        .from("conversations")
        .insert({
          listing_id: pendingNew.listingId,
          buyer_id: user.id,
          seller_id: pendingNew.sellerId,
        })
        .select(`
          *,
          listing:listings(title, images),
          seller:profiles!conversations_seller_id_fkey(name)
        `)
        .single();

      if (error || !conv) return;

      const newConv = {
        ...conv,
        listing: conv.listing,
        other_user: conv.seller,
      };

      setConversations((prev) => [newConv, ...prev]);
      setSelected(newConv);
      setPendingNew(null);
      setPendingListing(null);

      await supabase.from("messages").insert({
        conversation_id: conv.id,
        sender_id: user.id,
        content,
      });
      return;
    }

    if (!selected) return;
    await supabase.from("messages").insert({
      conversation_id: selected.id,
      sender_id: user.id,
      content,
    });
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const activeListingId = pendingNew ? pendingNew.listingId : selected?.listing_id;
  const activeHeader = pendingNew
    ? { name: "", title: pendingListing?.title || "Novo anuncio", image: pendingListing?.images?.[0] }
    : selected
    ? { name: selected.other_user?.name || "", title: selected.listing?.title || "", image: selected.listing?.images?.[0] }
    : null;

  if (loading) return (
    <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
      Carregando mensagens...
    </div>
  );

  const hasContent = conversations.length > 0 || pendingNew;

  if (!hasContent) return (
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
                onClick={() => { setSelected(conv); setPendingNew(null); }}
                className={`w-full text-left p-3 border-b border-border hover:bg-secondary transition-colors ${selected?.id === conv.id && !pendingNew ? "bg-primary/10 border-l-2 border-l-primary" : ""}`}
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

        {/* Area de chat */}
        <div className="md:col-span-2 border border-border rounded-lg overflow-hidden flex flex-col">
          {activeHeader ? (
            <>
              {/* Cabecalho com nome + link para anuncio */}
              <div className="p-3 border-b border-border bg-secondary flex items-center gap-3">
                <img
                  src={activeHeader.image || "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=60&h=60&fit=crop"}
                  alt=""
                  className="h-10 w-10 rounded-md object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  {activeHeader.name && (
                    <p className="font-semibold text-sm truncate">{activeHeader.name}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">{activeHeader.title}</p>
                </div>
                {activeListingId && (
                  <Link
                    to={`/anuncio/${activeListingId}`}
                    className="shrink-0 flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium bg-primary/10 px-2.5 py-1.5 rounded-md transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Ver anuncio
                  </Link>
                )}
              </div>

              <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {pendingNew && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Envie uma mensagem para iniciar a conversa!
                  </p>
                )}
                {!pendingNew && messages.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Nenhuma mensagem ainda.
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

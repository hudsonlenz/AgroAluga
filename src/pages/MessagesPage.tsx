import { useState, useEffect, useRef } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, ExternalLink } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

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
  listing?: { title: string; images: string[]; price: number; price_unit: string };
  other_user?: { id: string; name: string };
  unreadCount?: number;
}

export default function MessagesPage() {
  const { user, authLoading } = useApp();
  const [searchParams] = useSearchParams();
  const newListingId = searchParams.get("listing");
  const newSellerId = searchParams.get("seller");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [pendingNew, setPendingNew] = useState<{ listingId: string; sellerId: string } | null>(null);
  const [pendingListing, setPendingListing] = useState<{ title: string; images: string[]; price: number; price_unit: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  if (authLoading) return null;
  if (!user) return <Navigate to="/login" />;

  useEffect(() => { fetchConversations(); }, []);

  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected.id);
    markAsRead(selected.id);
    setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, unreadCount: 0 } : c));

    const channel = supabase
      .channel(`messages:${selected.id}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${selected.id}`,
      }, (payload) => {
        const msg = payload.new as Message;
        setMessages((prev) => [...prev, msg]);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        // Marca como lida automaticamente se o destinatario esta na conversa
        if (msg.sender_id !== user.id) {
          supabase.from("messages").update({ read: true }).eq("id", msg.id);
          setConversations(prev => prev.map(cv =>
            cv.id === msg.conversation_id ? { ...cv, unreadCount: 0 } : cv
          ));
        }
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
        listing:listings(title, images, price, price_unit),
        buyer:profiles!conversations_buyer_id_fkey(id, name),
        seller:profiles!conversations_seller_id_fkey(id, name)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (data) {
      // Busca contagem de nao lidas para cada conversa
      const convIds = data.map((c: any) => c.id);
      const { data: unreadData } = await supabase
        .from("messages")
        .select("conversation_id")
        .in("conversation_id", convIds)
        .neq("sender_id", user.id)
        .or("read.eq.false,read.is.null");
      const unreadMap: Record<string, number> = {};
      (unreadData || []).forEach((m: any) => {
        unreadMap[m.conversation_id] = (unreadMap[m.conversation_id] || 0) + 1;
      });
      const convs = data.map((c: any) => ({
        ...c,
        listing: c.listing,
        other_user: user.id === c.buyer_id ? c.seller : c.buyer,
        unreadCount: unreadMap[c.id] || 0,
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
            .select("title, images, price, price_unit")
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
      setTimeout(() => {
        if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      }, 50);
    }
  }

  async function markAsRead(conversationId: string) {
    await supabase.from("messages").update({ read: true })
      .eq("conversation_id", conversationId).neq("sender_id", user.id);
  }

  async function sendMessage() {
    if (!input.trim()) return;
    if (user?.blocked) { alert("Sua conta está bloqueada e não pode enviar mensagens."); return; }
    const content = input.trim();
    setInput("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);

    if (pendingNew) {
      const { data: conv, error } = await supabase
        .from("conversations")
        .insert({ listing_id: pendingNew.listingId, buyer_id: user.id, seller_id: pendingNew.sellerId })
        .select(`*, listing:listings(title, images, price, price_unit), seller:profiles!conversations_seller_id_fkey(id, name)`)
        .single();

      if (error || !conv) return;
      const newConv = { ...conv, listing: conv.listing, other_user: conv.seller };
      setConversations((prev) => [newConv, ...prev]);
      setSelected(newConv);
      setPendingNew(null);
      setPendingListing(null);
      await supabase.from("messages").insert({ conversation_id: conv.id, sender_id: user.id, content });
      return;
    }

    if (!selected) return;
    await supabase.from("messages").insert({ conversation_id: selected.id, sender_id: user.id, content });
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const activeListingId = pendingNew ? pendingNew.listingId : selected?.listing_id;

  const activeListing = pendingNew
    ? pendingListing
    : selected?.listing;

  const activeOtherUser = pendingNew
    ? { id: pendingNew.sellerId, name: "" }
    : selected?.other_user || null;

  if (loading) return (
    <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Carregando mensagens...</div>
  );

  const hasContent = conversations.length > 0 || pendingNew;

  if (!hasContent) return (
    <div className="container mx-auto px-4 py-20 text-center">
      <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground mb-4">Voce ainda nao tem conversas.</p>
      <Link to="/busca"><Button className="bg-primary text-primary-foreground">Buscar servicos</Button></Link>
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
                    alt="" className="h-10 w-10 rounded-md object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{conv.other_user?.name || "Usuario"}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.listing?.title}</p>
                  </div>
                  {conv.unreadCount ? (
                    <span className="shrink-0 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Area de chat */}
        <div className="md:col-span-2 border border-border rounded-lg overflow-hidden flex flex-col">
          {activeListing || pendingNew ? (
            <>
              {/* Cabecalho: anuncio a esquerda, anunciante a direita */}
              <div className="px-4 py-3 border-b border-border bg-secondary flex items-center justify-between gap-3">
                {/* Esquerda: info do anuncio */}
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={activeListing?.images?.[0] || "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=60&h=60&fit=crop"}
                    alt="" className="h-12 w-12 rounded-md object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{activeListing?.title || "Anuncio"}</p>
                    {activeListing?.price && (
                      <p className="text-xs text-primary font-medium">
                        R$ {activeListing.price}/{activeListing.price_unit}
                      </p>
                    )}
                    {activeListingId && (
                      <Link to={`/anuncio/${activeListingId}`} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                        <ExternalLink className="h-3 w-3" /> Ver anuncio
                      </Link>
                    )}
                  </div>
                </div>

                {/* Direita: anunciante */}
                {activeOtherUser && (
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Anunciante</p>
                      <p className="text-sm font-medium">{activeOtherUser.name}</p>
                    </div>
                    <UserAvatar userId={activeOtherUser.id} name={activeOtherUser.name || ""} size="sm" />
                  </div>
                )}
              </div>

              <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                {pendingNew && (
                  <p className="text-center text-sm text-muted-foreground py-8">Envie uma mensagem para iniciar a conversa!</p>
                )}
                {!pendingNew && messages.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">Nenhuma mensagem ainda.</p>
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
                <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Digite uma mensagem..." className="flex-1" />
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

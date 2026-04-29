import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";

export function useNotifications() {
  const { user } = useApp();
  const channelRef = useRef<any>(null);

  async function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || !("Notification" in window)) return false;
    try {
      const reg = await navigator.serviceWorker.register("/sw.js");
      console.log("SW registrado:", reg.scope);
      return reg;
    } catch (e) {
      console.error("Erro ao registrar SW:", e);
      return false;
    }
  }

  async function requestPermission() {
    if (!("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission === "denied") return false;
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  function showNotification(title: string, body: string, url: string, tag: string) {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag,
        renotify: true,
        data: { url },
        vibrate: [200, 100, 200],
      } as NotificationOptions);
    });
  }

  async function init() {
    if (!user) return;
    const granted = await requestPermission();
    if (!granted) return;
    await registerServiceWorker();

    // Realtime — mensagens novas
    channelRef.current = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (document.visibilityState === "visible") return;
          showNotification(
            "Nova mensagem — AgroAluga",
            payload.new?.content?.substring(0, 80) || "Voce recebeu uma nova mensagem.",
            "/mensagens",
            `msg-${payload.new?.id}`
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "listings",
          filter: `owner_id=eq.${user.id}`,
        },
        (payload: any) => {
          const status = payload.new?.status;
          const title = payload.new?.title || "seu anuncio";
          if (status === "active" && payload.old?.status === "pending") {
            showNotification(
              "Anuncio aprovado! — AgroAluga",
              `Seu anuncio "${title}" foi aprovado e esta ativo.`,
              "/dashboard",
              `listing-approved-${payload.new?.id}`
            );
          } else if (status === "rejected") {
            showNotification(
              "Anuncio rejeitado — AgroAluga",
              `Seu anuncio "${title}" foi rejeitado. Acesse o dashboard para mais detalhes.`,
              "/dashboard",
              `listing-rejected-${payload.new?.id}`
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "revealed_contacts",
          filter: `listing_owner_id=eq.${user.id}`,
        },
        (payload: any) => {
          if (document.visibilityState === "visible") return;
          showNotification(
            "Novo contato revelado! — AgroAluga",
            "Um cliente revelou seu contato. Aguarde o retorno!",
            "/dashboard",
            `contact-${payload.new?.id}`
          );
        }
      )
      .subscribe();
  }

  useEffect(() => {
    init();
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [user]);

  return { requestPermission };
}

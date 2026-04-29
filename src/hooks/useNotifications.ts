import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";

const ONESIGNAL_APP_ID = "c2d4c4d9-1b0d-4263-90e2-a6413ae117cd";

declare global {
  interface Window {
    OneSignalDeferred?: any[];
    OneSignal?: any;
  }
}

function loadOneSignal(): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById("onesignal-sdk")) { resolve(); return; }
    const script = document.createElement("script");
    script.id = "onesignal-sdk";
    script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export function useNotifications() {
  const { user } = useApp();
  const channelRef = useRef<any>(null);
  const initializedRef = useRef(false);

  async function initOneSignal() {
    if (initializedRef.current) return;
    initializedRef.current = true;
    await loadOneSignal();
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OneSignal: any) => {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: false,
        notifyButton: { enable: false },
      });
      if (user) {
        await OneSignal.login(user.id);
        const permission = await OneSignal.Notifications.permissionNative;
        if (permission === "default") {
          await OneSignal.Notifications.requestPermission();
        }
      }
    });
  }

  useEffect(() => {
    initOneSignal();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Associa o usuario ao OneSignal e pede permissao
    const linkUser = async () => {
      await loadOneSignal();
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async (OneSignal: any) => {
        await OneSignal.login(user.id);
        const permission = OneSignal.Notifications.permissionNative;
        if (permission === "default") {
          await OneSignal.Notifications.requestPermission();
        }
      });
    };
    linkUser();

    // Realtime para notificacoes locais (site aberto)
    const ch = supabase.channel(`notifications-${user.id}`);

    ch.on("postgres_changes",
      { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${user.id}` },
      (payload: any) => {
        if (document.visibilityState === "visible") return;
        if ("Notification" in window && Notification.permission === "granted") {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification("Nova mensagem — AgroAluga", {
              body: payload.new?.content?.substring(0, 80) || "Voce recebeu uma nova mensagem.",
              icon: "/favicon.ico",
              badge: "/favicon.ico",
              tag: `msg-${payload.new?.id}`,
              data: { url: "/mensagens" },
            } as NotificationOptions);
          });
        }
      }
    );

    ch.on("postgres_changes",
      { event: "UPDATE", schema: "public", table: "listings", filter: `owner_id=eq.${user.id}` },
      (payload: any) => {
        const status = payload.new?.status;
        const title = payload.new?.title || "seu anuncio";
        let msg = "";
        if (status === "active" && payload.old?.status === "pending") {
          msg = `Seu anuncio "${title}" foi aprovado!`;
        } else if (status === "rejected") {
          msg = `Seu anuncio "${title}" foi rejeitado.`;
        }
        if (msg && "Notification" in window && Notification.permission === "granted") {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification("AgroAluga", {
              body: msg,
              icon: "/favicon.ico",
              tag: `listing-${payload.new?.id}`,
              data: { url: "/dashboard" },
            } as NotificationOptions);
          });
        }
      }
    );

    ch.subscribe();
    channelRef.current = ch;

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
    };
  }, [user]);

  return {};
}

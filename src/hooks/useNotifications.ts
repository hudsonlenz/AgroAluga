import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";

const ONESIGNAL_APP_ID = "c2d4c4d9-1b0d-4263-90e2-a6413ae117cd";

declare global {
  interface Window { OneSignalDeferred?: any[]; OneSignal?: any; }
}

export async function initOneSignal(userId?: string) {
  // Carrega o SDK se ainda nao foi carregado
  if (!document.getElementById("onesignal-sdk")) {
    await new Promise<void>((resolve) => {
      const s = document.createElement("script");
      s.id = "onesignal-sdk";
      s.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
      s.async = true;
      s.onload = () => resolve();
      document.head.appendChild(s);
    });
  }

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OS: any) => {
    // Inicializa somente uma vez
    if (!OS._initAlreadyCalled) {
      OS._initAlreadyCalled = true;
      await OS.init({
        appId: ONESIGNAL_APP_ID,
        serviceWorkerPath: "/OneSignalSDKWorker.js",
        notifyButton: { enable: false },
      });
    }
    // Aguarda SW estar registrado antes de fazer login
    if (userId) {
      try {
        await OS.login(userId);
      } catch(e) {
        console.warn("OneSignal login error:", e);
      }
    }
  });
}

export function useNotifications() {
  const { user } = useApp();
  const channelRef = useRef<any>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!user || initializedRef.current) return;
    initializedRef.current = true;

    // Aguarda 2s para garantir que o SW esta registrado
    setTimeout(() => initOneSignal(user.id), 2000);

    const ch = supabase.channel(`notifications-${user.id}`);
    ch.on("postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload: any) => {
        if (payload.new?.sender_id === user.id) return;
        if (document.visibilityState === "visible") return;
        if ("Notification" in window && Notification.permission === "granted") {
          navigator.serviceWorker?.ready.then((reg) => {
            reg.showNotification("Nova mensagem — AgroAluga", {
              body: payload.new?.content?.substring(0, 80) || "Nova mensagem recebida.",
              icon: "/favicon.ico",
              tag: `msg-${payload.new?.id}`,
              data: { url: "/mensagens" },
            } as NotificationOptions);
          });
        }
      }
    );
    ch.subscribe();
    channelRef.current = ch;

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      initializedRef.current = false;
    };
  }, [user]);

  return {};
}

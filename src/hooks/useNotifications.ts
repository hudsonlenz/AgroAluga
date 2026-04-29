import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useApp } from "@/contexts/AppContext";

const ONESIGNAL_APP_ID = "c2d4c4d9-1b0d-4263-90e2-a6413ae117cd";

declare global {
  interface Window { OneSignalDeferred?: any[]; OneSignal?: any; }
}

export function useNotifications() {
  const { user } = useApp();
  const channelRef = useRef<any>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    // Inicializa OneSignal uma vez
    if (!document.getElementById("onesignal-sdk")) {
      const s = document.createElement("script");
      s.id = "onesignal-sdk";
      s.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
      s.async = true;
      document.head.appendChild(s);
    }
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OS: any) => {
      if (OS._initDone) return;
      OS._initDone = true;
      await OS.init({
        appId: ONESIGNAL_APP_ID,
        serviceWorkerPath: "/OneSignalSDKWorker.js",
        notifyButton: { enable: false },
      });
    });
  }, []);

  useEffect(() => {
    if (!user || initializedRef.current) return;
    initializedRef.current = true;

    // Usa tag para identificar usuario em vez de login
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    window.OneSignalDeferred.push(async (OS: any) => {
      try {
        // Tag com user_id para o backend encontrar o subscriber
        await OS.User.addTags({ user_id: user.id });
      } catch(e) {
        console.warn("OneSignal tag error:", e);
      }
    });

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

export async function initOneSignal(userId?: string) {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(async (OS: any) => {
    try {
      await OS.Notifications.requestPermission();
      if (userId) await OS.User.addTags({ user_id: userId });
    } catch(e) {
      console.warn("OneSignal permission error:", e);
    }
  });
}

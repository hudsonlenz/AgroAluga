import { Bell, BellOff } from "lucide-react";
import { useState, useEffect } from "react";

export function NotificationButton() {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) setPermission(Notification.permission);
  }, []);

  const handleClick = async () => {
    if (!("Notification" in window)) {
      alert("Seu navegador nao suporta notificacoes.");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification("AgroAluga", {
          body: "Notificacoes ativadas com sucesso!",
          icon: "/favicon.ico",
          badge: "/favicon.ico",
        } as NotificationOptions);
      });
    }
  };

  if (permission === "denied") return null;

  return (
    <button
      onClick={handleClick}
      title={permission === "granted" ? "Notificacoes ativas" : "Ativar notificacoes"}
      className={`p-2 rounded-full transition-colors ${
        permission === "granted"
          ? "text-accent hover:bg-accent/10"
          : "text-muted-foreground hover:bg-secondary animate-pulse"
      }`}
    >
      {permission === "granted"
        ? <Bell className="h-5 w-5" />
        : <Bell className="h-5 w-5" />
      }
    </button>
  );
}

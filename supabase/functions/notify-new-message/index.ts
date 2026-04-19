import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  const { recipient_email, recipient_name, sender_name, listing_title, message_preview } = await req.json();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "AgroAluga <onboarding@resend.dev>",
      to: [recipient_email],
      subject: `Nova mensagem de ${sender_name} — AgroAluga`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2d5a1b;">💬 Nova mensagem recebida</h2>
          <p>Ola, <strong>${recipient_name}</strong>!</p>
          <p><strong>${sender_name}</strong> enviou uma mensagem sobre o anuncio <strong>"${listing_title}"</strong>:</p>
          <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #2d5a1b;">
            <p style="margin:0;color:#333;">"${message_preview}"</p>
          </div>
          <a href="https://agro-aluga.vercel.app/mensagens" style="display:inline-block;background:#2d5a1b;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;">Responder mensagem</a>
          <p style="color:#666;margin-top:24px;font-size:14px;">Equipe AgroAluga</p>
        </div>
      `,
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    status: res.ok ? 200 : 400,
  });
});

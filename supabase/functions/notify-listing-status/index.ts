import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

serve(async (req) => {
  const { listing_title, owner_email, owner_name, status } = await req.json();

  const isApproved = status === "active";
  const subject = isApproved
    ? "Seu anuncio foi aprovado — AgroAluga"
    : "Atualizacao sobre seu anuncio — AgroAluga";

  const html = isApproved
    ? `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d5a1b;">🎉 Anuncio aprovado!</h2>
        <p>Ola, <strong>${owner_name}</strong>!</p>
        <p>Seu anuncio <strong>"${listing_title}"</strong> foi aprovado e ja esta visivel para todos os usuarios do AgroAluga.</p>
        <a href="https://agro-aluga.vercel.app/busca" style="display:inline-block;background:#2d5a1b;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px;">Ver meu anuncio</a>
        <p style="color:#666;margin-top:24px;font-size:14px;">Equipe AgroAluga</p>
      </div>
    `
    : `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #b91c1c;">Anuncio nao aprovado</h2>
        <p>Ola, <strong>${owner_name}</strong>!</p>
        <p>Infelizmente seu anuncio <strong>"${listing_title}"</strong> nao foi aprovado pela nossa equipe de moderacao.</p>
        <p>Voce pode criar um novo anuncio seguindo nossas diretrizes de uso.</p>
        <a href="https://agro-aluga.vercel.app/criar-anuncio" style="display:inline-block;background:#2d5a1b;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;margin-top:16px;">Criar novo anuncio</a>
        <p style="color:#666;margin-top:24px;font-size:14px;">Equipe AgroAluga</p>
      </div>
    `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "AgroAluga <noreply@agroaluga.com.br>",
      to: [owner_email],
      subject,
      html,
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
    status: res.ok ? 200 : 400,
  });
});

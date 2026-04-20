import { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Flag } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

interface Review {
  id: string;
  listing_id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  reported: boolean;
  created_at: string;
  reviewer?: { name: string };
}

interface ReviewSectionProps {
  listingId: string;
  ownerId: string;
  revealed: boolean;
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button"
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
        >
          <Star className={`h-6 w-6 transition-colors ${s <= (hover || value) ? "fill-accent text-accent" : "text-muted-foreground"}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ listingId, ownerId, revealed }: ReviewSectionProps) {
  const { user } = useApp();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reporting, setReporting] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userReview = reviews.find((r) => r.reviewer_id === user?.id);
  const canReview = revealed && user && user.id !== ownerId && !userReview;

  useEffect(() => {
    fetchReviews();
  }, [listingId]);

  async function fetchReviews() {
    setLoading(true);
    const { data } = await supabase
      .from("reviews")
      .select("*, reviewer:profiles!reviews_reviewer_id_fkey(name)")
      .eq("listing_id", listingId)
      .eq("reported", false)
      .order("created_at", { ascending: false });
    if (data) setReviews(data);
    setLoading(false);
  }

  async function submitReview() {
    if (!rating) { setError("Selecione uma nota."); return; }
    if (!comment.trim()) { setError("Escreva um comentario."); return; }
    setSubmitting(true);
    setError("");
    const { error } = await supabase.from("reviews").insert({
      listing_id: listingId,
      reviewer_id: user!.id,
      rating,
      comment: comment.trim(),
    });
    if (error) {
      setError("Erro ao enviar avaliação.");
    } else {
      setSuccess("Avaliação enviada com sucesso!");
      setRating(0);
      setComment("");
      fetchReviews();
      setTimeout(() => setSuccess(""), 3000);
    }
    setSubmitting(false);
  }

  async function reportReview(reviewId: string) {
    if (!reportReason.trim()) return;
    await supabase.from("reviews").update({
      reported: true,
      report_reason: reportReason.trim(),
    }).eq("id", reviewId);
    setReporting(null);
    setReportReason("");
    fetchReviews();
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-semibold text-lg">
          Avaliações {reviews.length > 0 && `(${reviews.length})`}
        </h3>
        {avgRating && (
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-accent text-accent" />
            <span className="font-bold text-lg">{avgRating}</span>
          </div>
        )}
      </div>

      {/* Formulário de avaliação */}
      {canReview && (
        <div className="bg-secondary p-4 rounded-lg space-y-3 border border-border">
          <p className="font-medium text-sm">Deixe sua avaliação</p>
          {error && <p className="text-xs text-destructive">{error}</p>}
          {success && <p className="text-xs text-green-600">{success}</p>}
          <StarPicker value={rating} onChange={setRating} />
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Conte sua experiencia com este fornecedor..."
            rows={3}
          />
          <Button
            onClick={submitReview}
            disabled={submitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
          >
            {submitting ? "Enviando..." : "Enviar avaliação"}
          </Button>
        </div>
      )}

      {!revealed && user && user.id !== ownerId && (
        <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-lg">
          Revele o contato do fornecedor para poder avaliar.
        </p>
      )}

      {/* Lista de avaliações */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando avaliacoes...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma avaliacao ainda.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-secondary p-4 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserAvatar userId={r.reviewer_id} name={r.reviewer?.name || ""} size="sm" />
                  <span className="font-medium text-sm">{r.reviewer?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} className={`h-4 w-4 ${s <= r.rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  {user && user.id !== r.reviewer_id && (
                    <button
                      onClick={() => setReporting(reporting === r.id ? null : r.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                      title="Reportar avaliacao"
                    >
                      <Flag className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{r.comment}</p>

              {/* Formulário de reporte */}
              {reporting === r.id && (
                <div className="mt-2 space-y-2 border-t border-border pt-2">
                  <p className="text-xs font-medium text-destructive">Reportar avaliacao</p>
                  <Textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Explique o motivo do reporte..."
                    rows={2}
                    className="text-xs"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setReporting(null)}>Cancelar</Button>
                    <Button size="sm" className="bg-destructive text-white hover:bg-destructive/90" onClick={() => reportReview(r.id)} disabled={!reportReason.trim()}>
                      Reportar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

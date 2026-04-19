import { useParams } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { MapPin, Phone, Mail, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";
import { useState } from "react";

export default function ListingDetail() {
  const { id } = useParams();
  const { listings, reviews, revealedContacts, revealContact, user } = useApp();
  const listing = listings.find((l) => l.id === id);
  const [contactVisible, setContactVisible] = useState(false);
  const listingReviews = reviews.filter((r) => r.listingId === id);
  const revealed = revealedContacts.includes(id || "") || contactVisible;

  if (!listing) return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Anúncio não encontrado.</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Image */}
      <div className="rounded-lg overflow-hidden mb-6 h-72 md:h-96">
        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">{listing.category}</span>
            <h1 className="text-2xl font-heading font-bold mt-2">{listing.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" /> {listing.city}, {listing.state} — {listing.distance} km de você
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">{listing.description}</p>

          {/* Availability */}
          <div>
            <h3 className="font-heading font-semibold mb-3 flex items-center gap-2"><Calendar className="h-4 w-4 text-accent" /> Disponibilidade</h3>
            <div className="flex gap-2">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
                <span
                  key={d}
                  className={`px-3 py-1 text-xs rounded-full font-medium ${listing.availability.includes(d) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h3 className="font-heading font-semibold mb-3">Avaliações ({listing.reviewCount})</h3>
            <div className="space-y-4">
              {listingReviews.map((r) => (
                <div key={r.id} className="bg-secondary p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{r.userName}</span>
                    <StarRating rating={r.rating} size={14} />
                  </div>
                  <p className="text-sm text-muted-foreground">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="text-center">
              <span className="text-3xl font-heading font-extrabold text-primary">R$ {listing.price}</span>
              <span className="text-sm text-muted-foreground ml-1">/{listing.priceUnit}</span>
            </div>
            <div className="flex items-center justify-center gap-1">
              <StarRating rating={Math.round(listing.rating)} />
              <span className="text-sm font-medium ml-1">{listing.rating}</span>
              <span className="text-xs text-muted-foreground">({listing.reviewCount})</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">Fornecedor: {listing.ownerName}</p>

            {revealed ? (
              <div className="space-y-2 bg-primary/5 p-4 rounded-lg border border-primary/20">
                <p className="text-xs font-medium text-primary uppercase">Contato do fornecedor</p>
                <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-primary" /> {listing.phone}</div>
                <div className="flex items-center gap-2 text-sm"><MessageCircle className="h-4 w-4 text-primary" /> {listing.whatsapp}</div>
                <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-primary" /> {listing.email}</div>
              </div>
            ) : (
              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                onClick={() => { setContactVisible(true); revealContact(listing.id); }}
              >
                Ver contato gratuitamente
              </Button>
            )}
          </div>
        </div>
      </div>


    </div>
  );
}

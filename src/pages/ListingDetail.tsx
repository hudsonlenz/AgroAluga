import { useParams, useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { MapPin, Phone, Mail, MessageCircle, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";
import ChatButton from "@/components/ChatButton";
import ReviewSection from "@/components/ReviewSection";
import UserAvatar from "@/components/UserAvatar";
import { useState } from "react";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { listings, revealedContacts, revealContact, user } = useApp();
  const listing = listings.find((l) => l.id === id);
  const [contactVisible, setContactVisible] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const revealed = revealedContacts.includes(id || "") || contactVisible;

  if (!listing) return (
    <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
      Anúncio não encontrado.
    </div>
  );

  const images = listing.images || [];
  const hasMultiple = images.length > 1;

  const prev = () => setCurrentImg((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setCurrentImg((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">

      {/* Galeria */}
      <div className="mb-6">
        <div className="relative rounded-lg overflow-hidden h-72 md:h-96 bg-muted cursor-pointer" onClick={() => setLightbox(true)}>
          <img
            src={images[currentImg]}
            alt={listing.title}
            className="w-full h-full object-cover transition-all duration-300"
          />
          {hasMultiple && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setCurrentImg(i); }}
                    className={`h-2 rounded-full transition-all ${i === currentImg ? "bg-white w-6" : "bg-white/50 w-2"}`}
                  />
                ))}
              </div>
              <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {currentImg + 1}/{images.length}
              </span>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {hasMultiple && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImg(i)}
                className={`shrink-0 h-16 w-20 rounded-md overflow-hidden border-2 transition-all ${i === currentImg ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-gray-300" onClick={() => setLightbox(false)}>
            <X className="h-8 w-8" />
          </button>
          {hasMultiple && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
              onClick={(e) => { e.stopPropagation(); prev(); }}
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
          )}
          <img
            src={images[currentImg]}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {hasMultiple && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
              onClick={(e) => { e.stopPropagation(); next(); }}
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          )}
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
            {currentImg + 1} / {images.length}
          </span>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">{listing.category}</span>
            <h1 className="text-2xl font-heading font-bold mt-2">{listing.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <MapPin className="h-4 w-4" /> {listing.city}, {listing.state}
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">{listing.description}</p>

          <div>
            <h3 className="font-heading font-semibold mb-3 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-accent" /> Disponibilidade
            </h3>
            <div className="flex gap-2 flex-wrap">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((d) => (
                <span key={d} className={`px-3 py-1 text-xs rounded-full font-medium ${listing.availability.includes(d) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {d}
                </span>
              ))}
            </div>
          </div>

          <ReviewSection listingId={listing.id} ownerId={listing.ownerId} revealed={revealed} />
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="text-center">
              <span className="text-3xl font-heading font-extrabold text-primary">R$ {listing.price}</span>
              <span className="text-sm text-muted-foreground ml-1">/{listing.priceUnit}</span>
            </div>
            {listing.rating > 0 && (
              <div className="flex items-center justify-center gap-1">
                <StarRating rating={Math.round(listing.rating)} />
                <span className="text-sm font-medium ml-1">{listing.rating}</span>
                <span className="text-xs text-muted-foreground">({listing.reviewCount})</span>
              </div>
            )}

            <ChatButton listingId={listing.id} sellerId={listing.ownerId} />

            {revealed ? (
              <div className="space-y-2 bg-primary/5 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3 mb-2">
                  <UserAvatar userId={listing.ownerId} name={listing.ownerName} size="md" />
                  <p className="font-semibold text-sm">{listing.ownerName}</p>
                </div>
                <p className="text-xs font-medium text-primary uppercase">Contato do fornecedor</p>
                {listing.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-primary" /> {listing.phone}</div>}
                {listing.whatsapp && <div className="flex items-center gap-2 text-sm"><MessageCircle className="h-4 w-4 text-primary" /> {listing.whatsapp}</div>}
                {listing.email && <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-primary" /> {listing.email}</div>}
              </div>
            ) : (
              <Button
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-semibold"
                onClick={() => {
                  if (!user) { navigate("/login"); return; }
                  setContactVisible(true);
                  revealContact(listing.id);
                }}
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

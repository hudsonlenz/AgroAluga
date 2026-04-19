import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import { Listing } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="bg-card rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow animate-fade-in border border-border/50">
      <div className="h-48 overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-4 space-y-2">
        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
          {listing.category}
        </span>
        <h3 className="font-heading font-semibold text-card-foreground line-clamp-1">{listing.title}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          {listing.city}, {listing.state} — <span className="text-accent font-medium">{listing.distance} km</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-primary">R$ {listing.price}</span>
            <span className="text-xs text-muted-foreground ml-1">/{listing.priceUnit}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-medium">{listing.rating}</span>
            <span className="text-muted-foreground">({listing.reviewCount})</span>
          </div>
        </div>
        <Link to={`/anuncio/${listing.id}`}>
          <Button className="w-full mt-2 bg-primary hover:bg-primary-medium text-primary-foreground font-medium" size="sm">
            Ver Detalhes
          </Button>
        </Link>
      </div>
    </div>
  );
}

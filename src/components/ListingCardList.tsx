import { Link } from "react-router-dom";
import { MapPin, Star } from "lucide-react";
import { Listing } from "@/contexts/AppContext";

export default function ListingCardList({ listing }: { listing: Listing }) {
  return (
    <Link to={`/anuncio/${listing.id}`} className="flex bg-card rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all border border-border/50 hover:border-primary/30 cursor-pointer">
      <div className="w-32 h-28 shrink-0 overflow-hidden">
        <img
          src={listing.images[0]}
          alt={listing.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="flex-1 p-4 flex items-center justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {listing.category}
          </span>
          <h3 className="font-heading font-semibold text-card-foreground mt-1 truncate">{listing.title}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {listing.city}, {listing.state}
          </div>
          {listing.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{listing.description}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div>
            <span className="text-lg font-bold text-primary">R$ {listing.price}</span>
            <span className="text-xs text-muted-foreground ml-1">/{listing.priceUnit}</span>
          </div>
          {listing.rating > 0 && (
            <div className="flex items-center justify-end gap-1 text-sm mt-1">
              <Star className="h-3.5 w-3.5 fill-accent text-accent" />
              <span className="font-medium text-xs">{listing.rating}</span>
              <span className="text-muted-foreground text-xs">({listing.reviewCount})</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

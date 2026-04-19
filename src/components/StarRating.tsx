import { Star } from "lucide-react";

export default function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={i <= rating ? "fill-accent text-accent" : "text-border"}
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
}

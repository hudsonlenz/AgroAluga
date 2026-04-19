import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "lucide-react";

interface UserAvatarProps {
  userId: string;
  name: string;
  size?: "sm" | "md" | "lg";
}

export default function UserAvatar({ userId, name, size = "md" }: UserAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const sizes = { sm: "h-6 w-6", md: "h-10 w-10", lg: "h-14 w-14" };
  const iconSizes = { sm: "h-3 w-3", md: "h-5 w-5", lg: "h-7 w-7" };

  useEffect(() => {
    supabase.from("profiles").select("avatar_url").eq("id", userId).single()
      .then(({ data }) => setAvatarUrl(data?.avatar_url || null));
  }, [userId]);

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden bg-muted border border-border flex items-center justify-center shrink-0`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <User className={`${iconSizes[size]} text-muted-foreground`} />
      )}
    </div>
  );
}

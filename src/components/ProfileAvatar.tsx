import { User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isRealProfileImage } from "@/lib/profile-image";
import { cn } from "@/lib/utils";

type ProfileAvatarProps = {
  name?: string;
  src?: string | null;
  className?: string;
  iconClassName?: string;
};

/**
 * Real photo when available; otherwise a neutral profile icon.
 * Gradient / generated placeholders (e.g. avatar.vercel.sh) are treated as empty.
 */
export function ProfileAvatar({
  name,
  src,
  className,
  iconClassName,
}: ProfileAvatarProps) {
  const image = isRealProfileImage(src) ? src!.trim() : undefined;

  return (
    <Avatar className={cn("h-9 w-9", className)}>
      {image ? (
        <AvatarImage src={image} alt={name ?? "Profile"} className="object-cover" />
      ) : null}
      <AvatarFallback className="bg-slate-100 text-slate-500">
        <User className={cn("h-4 w-4", iconClassName)} aria-hidden />
        <span className="sr-only">{name ?? "Profile"}</span>
      </AvatarFallback>
    </Avatar>
  );
}

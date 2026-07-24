import { ProfileAvatar } from "@/components/ProfileAvatar";
import { cn } from "@/lib/utils";

type AdminUserAvatarProps = {
  name?: string;
  avatarUrl?: string | null;
  className?: string;
  iconClassName?: string;
};

/** Admin header / auth avatar — profile icon when no real photo. */
export function AdminUserAvatar({
  name,
  avatarUrl,
  className,
  iconClassName,
}: AdminUserAvatarProps) {
  return (
    <ProfileAvatar
      name={name}
      src={avatarUrl}
      className={cn("h-8 w-8", className)}
      iconClassName={iconClassName}
    />
  );
}

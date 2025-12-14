"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

const AVATAR_VARIANTS = [
  "bg-gradient-to-br from-neutral-700 to-neutral-900 text-neutral-200",
  "bg-gradient-to-br from-slate-700 to-slate-900 text-slate-200",
  "bg-gradient-to-br from-zinc-700 to-zinc-900 text-zinc-200",
  "bg-gradient-to-br from-stone-700 to-stone-900 text-stone-200",
  "bg-gradient-to-br from-blue-900/80 to-neutral-900 text-blue-200",
  "bg-gradient-to-br from-emerald-900/80 to-neutral-900 text-emerald-200",
  "bg-gradient-to-br from-purple-900/80 to-neutral-900 text-purple-200",
];

const getColorClass = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_VARIANTS.length;
  return AVATAR_VARIANTS[index];
};

type UserAvatarProps = {
  user: {
    name: string;
    image?: string | null;
  };
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
};

const sizeConfig = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
  xl: "w-24 h-24 text-3xl",
  full: "w-full h-full text-base",
};

export const UserAvatar = ({
  user,
  size = "sm",
  className = "",
}: UserAvatarProps) => {
  const [imageError, setImageError] = useState(false);

  const initials = useMemo(() => {
    return (user.name || "Anonymous")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [user.name]);

  const colorClass = useMemo(
    () => getColorClass(user.name || "mid"),
    [user.name]
  );
  const sizeClass = sizeConfig[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`relative w-full h-full rounded-full ${className}`}
    >
      <div
        className={`
          ${sizeClass} 
          relative flex items-center justify-center 
          rounded-full overflow-hidden 
          ring-1 ring-white/10 shadow-sm
          ${!user.image || imageError ? colorClass : "bg-neutral-900"}
        `}
      >
        {user.image && !imageError ? (
          <img
            src={user.image}
            alt={user.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="font-mono font-semibold tracking-tighter leading-none select-none">
            {initials}
          </span>
        )}
      </div>
    </motion.div>
  );
};

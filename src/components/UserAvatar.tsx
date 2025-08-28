const getColorFromString = (str: string) => {
  const colors = [
    "bg-gradient-to-r from-gray-700 via-gray-900 to-black",
    "bg-gradient-to-r from-indigo-800 via-purple-900 to-indigo-800",
    "bg-gradient-to-r from-slate-700 via-slate-900 to-slate-800",
    "bg-gradient-to-r from-blue-900 via-gray-800 to-gray-900",
    "bg-gradient-to-r from-teal-800 via-gray-900 to-cyan-900",
    "bg-gradient-to-r from-zinc-800 via-gray-800 to-neutral-900",
    "bg-gradient-to-r from-purple-800 via-black to-purple-900",
    "bg-gradient-to-r from-emerald-800 via-gray-900 to-emerald-900",
  ];

  const index = str.charCodeAt(0) % colors.length;
  return colors[index];
};

type UserAvatarProps = {
  user: {
    name: string;
    image?: string;
  };
  className?: string;
  size?: "sm" | "md" | "lg" | "full";
};

const sizeClasses = {
  sm: "w-9 h-9 text-sm",
  md: "w-16 h-16 text-2xl",
  lg: "w-full h-full text-[3rem] sm:text-[4rem]",
  full: "w-full h-full text-sm sm:text-md md:text-lg",
};

export const UserAvatar = ({
  user,
  size = "sm",
  className,
}: UserAvatarProps) => {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const combinedClasses = `${
    sizeClasses[size]
  } rounded-full flex items-center justify-center text-white font-semibold border-2 border-gray-900 shadow-sm ${className} ${getColorFromString(
    user.name
  )}`;

  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name}
        title={user.name}
        className={`${sizeClasses[size]} rounded-full border-2 border-gray-900 object-cover shadow-sm ${className}`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = "/default-avatar.jpg";
        }}
      />
    );
  }

  return (
    <div className={combinedClasses} title={user.name}>
      {initials}
    </div>
  );
};

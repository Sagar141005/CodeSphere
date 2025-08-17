"use client";

import { SquareDashedBottomCode } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const HomeNavbar = () => {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <div className="w-full flex items-center justify-between px-8 py-5 bg-black z-50">
      {/* Logo + Left Nav */}
      <div className="flex items-center gap-12">
        <Link href="/" className="flex items-center gap-3 group relative">
          {/* Glow effect */}
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />

          {/* Logo icon */}
          <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] p-2 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
            <SquareDashedBottomCode className="w-6 h-6 text-blue-400 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500" />
          </div>

          {/* Brand name */}
          <div className="relative">
            <span className="block text-lg font-semibold bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 text-transparent bg-clip-text leading-tight">
              CodeSphere
            </span>
            <span className="block text-xs text-blue-400/60 font-medium tracking-wide">
              Interactive Code Editor
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <div className="flex items-center gap-6">
          <Link
            href="/rooms"
            className="text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors"
          >
            Rooms
          </Link>
          <Link
            href="/teams"
            className="text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors"
          >
            Teams
          </Link>
        </div>
      </div>

      {/* Right: Avatar or Sign Up */}
      {status === "authenticated" && user ? (
        <Link href="/profile">
          <img
            src={user.image ?? "/default-avatar.png"}
            alt={user.name ?? "User"}
            onError={(e) => (e.currentTarget.src = "/default-avatar.jpg")}
            className="w-9 h-9 rounded-full border border-blue-400 hover:scale-105 transition-transform duration-300 object-cover"
          />
        </Link>
      ) : (
        <Link
          href="/signup"
          className="px-5 py-2 rounded-lg text-sm font-medium text-blue-100 bg-gray-800/40 hover:bg-blue-500/20 border border-gray-700 hover:border-blue-400 transition-all duration-300 shadow-lg"
        >
          Sign up
        </Link>
      )}
    </div>
  );
};

export default HomeNavbar;

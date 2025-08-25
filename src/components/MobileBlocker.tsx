"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MobileBlocker() {
  const router = useRouter();
  const [isSmallScreen, setIsSmallScreen] = useState<boolean | null>(null);

  useEffect(() => {
    const checkScreen = () => setIsSmallScreen(window.innerWidth < 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (!isSmallScreen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-gradient-to-br from-black via-[#111111] to-gray-900 text-white px-4 sm:px-6">
      <div className="bg-[#1a1a1a] bg-opacity-90 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-lg max-w-md w-full text-center animate-fade-in">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-4">
          🚫 Unsupported on Mobile
        </h1>

        <p className="text-gray-300 mb-4 text-base sm:text-lg">
          The <span className="font-medium text-white">Editor</span> is
          optimized for larger screens like laptops or desktops.
        </p>

        <p className="text-sm text-gray-500 mb-6">
          Mobile and tablet layouts are currently not supported.
        </p>

        <button
          onClick={() => router.back()}
          className="mt-2 inline-block px-4 py-2 rounded-md bg-white text-black font-medium hover:bg-gray-200 transition-all text-sm sm:text-base cursor-pointer"
          aria-label="Dismiss unsupported screen message"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

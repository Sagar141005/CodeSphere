"use client";

import { useEffect, useState } from "react";

export default function MobileBlocker() {
  const [isSmallScreen, setIsSmallScreen] = useState<boolean | null>(null);

  useEffect(() => {
    const checkScreen = () => setIsSmallScreen(window.innerWidth < 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (!isSmallScreen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 text-white z-[999]">
      <div className="text-center p-6 max-w-sm">
        <h1 className="text-2xl font-bold mb-4">🚫 Not Supported on Mobile</h1>
        <p className="text-gray-300 mb-6">
          The RoomPage editor works best on larger screens (laptops or
          desktops). Please switch to a bigger device for the best coding
          experience.
        </p>
        <p className="tex-sm text-gray-400">
          (For now, mobile & tablet layouts are not supported.)
        </p>
      </div>
    </div>
  );
}

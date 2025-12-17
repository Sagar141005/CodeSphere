"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Laptop, ArrowLeft, Smartphone } from "lucide-react";

export default function MobileBlocker() {
  const router = useRouter();
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkScreen = () => setIsSmallScreen(window.innerWidth < 1024);

    // Initial check
    checkScreen();

    // Listen for resize
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Prevent hydration mismatch or flashing
  if (!mounted || !isSmallScreen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-950 text-neutral-50 px-6 overflow-hidden">
      {/* --- Consistent Background Pattern --- */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--neutral-800) 1px, transparent 1px), linear-gradient(90deg, var(--neutral-800) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Main Card */}
          <div className="bg-[#0F0F0F] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Illustration Area */}
            <div className="bg-neutral-900/50 border-b border-neutral-800 p-8 flex items-center justify-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shadow-sm">
                  <Laptop className="w-10 h-10 text-neutral-200" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-lg">
                  <Smartphone className="w-5 h-5 text-neutral-600" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-0.5 bg-neutral-700 -rotate-45 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-8 text-center">
              <h1 className="text-xl font-bold tracking-tight text-neutral-50 mb-3">
                Desktop Environment Required
              </h1>

              <p className="text-sm text-neutral-400 leading-relaxed mb-8">
                The CodeSphere Editor requires a larger display for complex code
                rendering, terminal output, and real-time collaboration tools.
              </p>

              {/* Action Button */}
              <button
                onClick={() => router.back()}
                className="group relative flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-neutral-50 hover:bg-white text-neutral-950 text-sm font-bold transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)] active:scale-[0.98]"
              >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span>Return to Dashboard</span>
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 animate-pulse" />
                Please resize window &gt; 1024px
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

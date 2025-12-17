"use client";

import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <div className="relative w-full min-h-screen bg-neutral-950 text-neutral-50 flex flex-col items-center justify-center px-6 overflow-hidden font-sans selection:bg-neutral-800 selection:text-white">
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl"
        >
          <SearchX className="w-10 h-10 text-neutral-400" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-8xl sm:text-9xl font-bold tracking-tighter text-neutral-100 select-none"
        >
          404
        </motion.h1>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-6 mt-6"
        >
          <h2 className="text-xl font-medium text-neutral-300">
            Page not found
          </h2>

          <p className="text-neutral-500 max-w-xs mx-auto leading-relaxed">
            The resource you are looking for might have been removed, had its
            name changed, or is temporarily unavailable.
          </p>

          <div className="mx-auto w-full max-w-xs bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 text-xs font-mono text-neutral-500 text-left space-y-1">
            <div className="flex justify-between">
              <span>Error Code:</span>
              <span className="text-neutral-300">ERR_NOT_FOUND</span>
            </div>
            <div className="flex justify-between">
              <span>Path:</span>
              <span className="text-neutral-300 truncate max-w-[120px]">
                /unknown-route
              </span>
            </div>
            <div className="flex justify-between">
              <span>Timestamp:</span>
              <span className="text-neutral-300">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/"
              className="group flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-neutral-50 hover:bg-white text-neutral-950 font-bold text-sm transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)] w-full sm:w-auto"
            >
              <span>Return Home</span>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="group flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-neutral-300 hover:text-white font-medium text-sm transition-colors w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Go Back</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

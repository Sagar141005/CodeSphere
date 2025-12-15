"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function CTASection() {
  return (
    <div className="w-full bg-neutral-950 border-y border-neutral-800 px-6 sm:px-12 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto  flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="flex flex-col justify-center gap-6 text-center md:text-left max-w-2xl">
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-neutral-50 leading-[0.95]">
            The simplest way <br className="hidden sm:block" />
            to build & collaborate <br className="hidden sm:block" />
            <span className="text-neutral-500">on code online.</span>
          </h2>

          <h4 className="text-sm sm:text-base font-medium text-neutral-400 leading-relaxed max-w-lg mx-auto md:mx-0">
            Cloud environment + real-time collaboration + version history in one
            dashboard.
          </h4>
        </div>

        <div className="relative z-10 flex-shrink-0 w-full md:w-auto">
          <Link href="/rooms" className="group relative block w-full md:w-auto">
            <div
              className="w-full md:w-auto rounded-xl bg-neutral-100 hover:bg-white text-neutral-950 h-20 sm:h-24 flex items-center justify-between px-8 gap-8 transition-all duration-300 
            hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex flex-col items-start">
                <span className="text-xl sm:text-2xl font-bold tracking-tight whitespace-nowrap">
                  Initialize Room
                </span>
                <span className="text-xs font-mono text-neutral-500 group-hover:text-neutral-400">
                  Start Collaborating
                </span>
              </div>

              <div className="w-10 h-10 rounded-full bg-neutral-950/10 flex items-center justify-center group-hover:bg-neutral-950/20 transition-colors">
                <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 group-hover:rotate-45 text-neutral-950" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

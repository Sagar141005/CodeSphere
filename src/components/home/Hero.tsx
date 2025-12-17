"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Terminal } from "lucide-react";
import Marquee from "react-fast-marquee";

const companies = [
  "Google",
  "Adobe",
  "Airbnb",
  "Spotify",
  "Meta",
  "Microsoft",
  "Netflix",
  "Tesla",
];

export default function HeroSection() {
  return (
    <div className="relative w-full min-h-screen flex flex-col justify-center px-6 lg:px-10 bg-neutral-950 overflow-hidden">
      <div
        className="absolute inset-0 z-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, var(--neutral-800) 1px, transparent 1px), linear-gradient(to bottom, var(--neutral-800) 1px, transparent 1px)`,
          backgroundSize: "4rem 4rem",
          maskImage:
            "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto py-20">
        <div className="flex flex-col items-start max-w-4xl">
          <div className="flex flex-col">
            {["Code.", "Collaborate.", "Ship."].map((word, i) => (
              <motion.h1
                key={word}
                custom={i}
                initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.15,
                  ease: [0.2, 0.65, 0.3, 0.9],
                }}
                className="text-6xl sm:text-8xl lg:text-9xl font-bold tracking-tighter bg-gradient-to-b text-transparent bg-clip-text from-white via-neutral-50 to-neutral-600 leading-[0.9]"
              >
                {word}
              </motion.h1>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="mt-8 text-lg sm:text-xl text-neutral-400 max-w-xl leading-relaxed"
          >
            The open-source collaborative code editor built for teams who care
            about speed. Real-time sync, zero latency, infinite possibilities.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex flex-wrap items-center gap-4 mt-10"
          >
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-6 py-3 rounded-lg bg-neutral-50 text-neutral-950 font-semibold text-sm overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Coding
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </motion.button>
            </Link>

            <Link href="/rooms">
              <motion.button
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(255,255,255,0.05)",
                }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-lg border border-neutral-800 text-neutral-200 font-medium text-sm transition-colors flex items-center gap-2"
              >
                <Terminal className="w-4 h-4 text-neutral-500" />
                Open Sandbox
              </motion.button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-24 lg:mt-32 w-full"
        >
          <p className="text-center text-xs font-semibold text-neutral-500 uppercase tracking-widest mb-8">
            Trusted by engineering teams at
          </p>

          <div className="relative flex overflow-hidden mask-fade-sides">
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-neutral-950 to-transparent z-20" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-neutral-950 to-transparent z-20" />

            <Marquee speed={40} gradient={false} autoFill className="w-full">
              <div className="flex gap-16 pr-16">
                {companies.map((company, i) => (
                  <div
                    key={`${company}-${i}`}
                    className="flex-shrink-0 flex items-center justify-center"
                  >
                    <img
                      src={`/${company}.svg`}
                      alt={company}
                      className="h-6 w-auto opacity-30 grayscale hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
              </div>
            </Marquee>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

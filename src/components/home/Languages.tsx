"use client";

import { motion } from "framer-motion";
import { Rocket, TerminalSquare, Users, Zap, Lock, Cpu } from "lucide-react";

export default function EnhancedHero() {
  const benefits = [
    {
      title: "Instant Start",
      description:
        "Open a workspace and start coding immediately. No installs, no setup steps, no waiting for environments to spin up.",
      icon: Zap,
    },
    {
      title: "Production-Grade Cloud",
      description:
        "Work inside real cloud machines with full system access. Run services, install dependencies, and test exactly like production.",
      icon: TerminalSquare,
    },
    {
      title: "Built for Teams",
      description:
        "Invite teammates into the same workspace, share live previews, and solve problems together without switching tools.",
      icon: Users,
    },
  ];

  return (
    <section className="relative w-full bg-neutral-950 text-neutral-50 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 flex flex-col items-center gap-8 pt-24 pb-12 px-4 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm"
          >
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-400">
              Easy to start
            </span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tighter leading-[1.1]">
            Code directly in the cloud <br className="hidden md:block" />
            with{" "}
            <span className=" bg-gradient-to-b text-transparent bg-clip-text from-white via-neutral-50 to-neutral-600">
              CodeSphere
            </span>
          </h1>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {["html", "css", "js", "node", "python", "java", "c++"].map(
              (lang, i) => (
                <div
                  key={i}
                  className="group relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-600 hover:-translate-y-5 transition-all duration-500 cursor-default"
                >
                  <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />

                  <img
                    src={`${lang}.svg`}
                    alt={lang}
                    loading="lazy"
                    className="relative z-10 w-8 h-8 sm:w-10 sm:h-10 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 grayscale group-hover:grayscale-0"
                  />
                </div>
              )
            )}
          </div>
        </div>

        <div className="py-24 px-4 sm:px-10 border-t border-neutral-900 bg-neutral-950/50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-semibold tracking-tight text-neutral-100 mb-6"
              >
                Why build with CodeSphere?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-neutral-400 text-lg max-w-2xl mx-auto"
              >
                Traditional development environments are fragile and slow. We
                built a platform that gets out of your way.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="group p-8 rounded-3xl border border-neutral-800 bg-neutral-900/20 hover:bg-neutral-900/50 transition-colors duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                      <benefit.icon size={26} strokeWidth={1.5} />
                    </div>

                    <h3 className="text-xl font-medium text-white mb-3">
                      {benefit.title}
                    </h3>

                    <p className="text-neutral-400 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

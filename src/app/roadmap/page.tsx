"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { motion } from "motion/react";
import { CheckCircle2, CircleDashed, Clock, GitCommit } from "lucide-react";

const roadmap = [
  {
    quarter: "Q1 2025",
    status: "completed",
    title: "Foundation",
    items: ["Real-time code editor", "Team collaboration", "AI code assistant"],
  },
  {
    quarter: "Q2 2025",
    status: "completed",
    title: "Core Workflow",
    items: [
      "Version control (Git-style)",
      "Dependency management",
      "File explorer with folders",
    ],
  },
  {
    quarter: "Q3 2025",
    status: "completed",
    title: "Communication",
    items: ["Voice & video calling", "Presence indicators", "Team spaces"],
  },
  {
    quarter: "Q4 2025",
    status: "in-progress",
    title: "Ecosystem",
    items: ["GitHub integration", "Export projects", "Advanced analytics"],
  },
];

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <HomeNavbar />

      <main className="relative pt-24 pb-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
          <header className="text-center mb-24">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold tracking-tighter text-neutral-50 mb-6"
            >
              Roadmap
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-neutral-400 max-w-lg mx-auto leading-relaxed"
            >
              We're building the future of collaborative coding. Here is what we
              are shipping next.
            </motion.p>
          </header>

          <div className="relative border-l border-neutral-800 ml-4 md:ml-0 space-y-12">
            {roadmap.map((phase, idx) => {
              const isCompleted = phase.status === "completed";
              const isProgress = phase.status === "in-progress";

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative pl-12 md:pl-16"
                >
                  <div
                    className={`absolute left-[-5px] top-2 w-2.5 h-2.5 rounded-full border-2 bg-neutral-950 z-20 ${
                      isCompleted
                        ? "border-neutral-50 bg-neutral-50"
                        : isProgress
                        ? "border-blue-500 bg-neutral-950 animate-pulse"
                        : "border-neutral-700 bg-neutral-950"
                    }`}
                  />

                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`font-mono text-xs font-bold uppercase tracking-wider ${
                        isCompleted
                          ? "text-neutral-500 line-through"
                          : isProgress
                          ? "text-blue-400"
                          : "text-neutral-500"
                      }`}
                    >
                      {phase.quarter}
                    </span>

                    {isProgress && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                        Current Focus
                      </span>
                    )}
                  </div>

                  <div className="group rounded-xl border border-neutral-800 bg-neutral-900/30 p-6 transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-900/60">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-neutral-50">
                        {phase.title}
                      </h2>

                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-neutral-50" />
                      ) : isProgress ? (
                        <CircleDashed className="w-5 h-5 text-blue-400 animate-spin-slow" />
                      ) : (
                        <Clock className="w-5 h-5 text-neutral-600" />
                      )}
                    </div>

                    <ul className="space-y-3">
                      {phase.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-neutral-400 text-sm group-hover:text-neutral-300 transition-colors"
                        >
                          <GitCommit className="w-4 h-4 mt-0.5 text-neutral-600 group-hover:text-neutral-500" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

"use client";

import Link from "next/link";
import HomeNavbar from "@/components/home/HomeNavbar";
import {
  ArrowRight,
  Users,
  GitBranch,
  Download,
  Code2,
  Undo2,
  Cpu,
  Mic,
  Boxes,
  PlayCircle,
} from "lucide-react";
import Footer from "@/components/Footer";
import { motion } from "motion/react";

export default function FeaturesPage() {
  const features = [
    {
      title: "Real-time Collaboration",
      description:
        "Collaborate with your team in real-time. Built-in voice calling lets you discuss changes without leaving the editor.",
      cta: "/rooms",
      ctaText: "Try Collaboration",
      icon: Users,
    },
    {
      title: "AI-Powered Dev",
      description:
        "Use AI to explain code, suggest fixes, and autocomplete functions directly in your rooms to speed up workflow.",
      cta: "/rooms",
      ctaText: "Try AI Assistant",
      icon: Cpu,
    },
    {
      title: "Team Management",
      description:
        "Create teams, add members, and manage rooms seamlessly. Keep your projects organized and your team in sync.",
      cta: "/teams",
      ctaText: "Manage Teams",
      icon: Mic,
    },
    {
      title: "Multi-Language Support",
      description:
        "Code in JavaScript, Node.js, Python, Java, C/C++, and more. Switch between languages and runtimes effortlessly.",
      cta: "/rooms",
      ctaText: "Start Coding",
      icon: Code2,
    },
    {
      title: "Git-Style Commits",
      description:
        "Keep track of changes with Git-style commits, view file history, revert to previous versions, and collaborate safely.",
      cta: "/rooms",
      ctaText: "Explore Version Control",
      icon: GitBranch,
    },
    {
      title: "Download Projects",
      description:
        "Download all your project files in one click as a ZIP. Keep local copies of your work or share it outside effortlessly.",
      cta: "/rooms",
      ctaText: "Download Now",
      icon: Download,
    },
    {
      title: "Undo / Redo History",
      description:
        "Never lose work. Each file keeps a scoped undo-redo history, even across sessions, ensuring you can backtrack safely.",
      cta: "/rooms",
      ctaText: "Try Undo/Redo",
      icon: Undo2,
    },
    {
      title: "Live Execution",
      description:
        "Instantly run your code in the cloud and preview results. Share live workspace links with teammates.",
      cta: "/rooms",
      ctaText: "Run Code",
      icon: PlayCircle,
    },
    {
      title: "Smart Dependencies",
      description:
        "Add libraries like Lodash, DayJS, or UUID per room. Previews automatically load dependencies without breaking setup.",
      cta: "/rooms",
      ctaText: "Manage Dependencies",
      icon: Boxes,
    },
  ];

  return (
    <div className="w-full min-h-screen bg-neutral-950 text-neutral-50">
      <HomeNavbar />

      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-neutral-50 mb-6">
              Power-packed <br />
              <span className="text-neutral-500">Features</span>
            </h1>
            <p className="text-neutral-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              Everything you need to code, collaborate, and ship faster — all in
              one unified cloud workspace.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="group relative flex flex-col p-8 rounded-3xl border border-neutral-800 bg-neutral-900/30 hover:bg-neutral-900/60 transition-all duration-300 hover:border-neutral-700"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white bg-neutral-800/80 border border-neutral-700 group-hover:scale-110 transition-transform duration-300">
                <feature.icon size={28} strokeWidth={1.5} />
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-medium text-neutral-100 mb-3 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-6">
                  {feature.description}
                </p>
              </div>

              <div className="pt-4 border-t border-neutral-800/50 mt-auto">
                <Link
                  href={feature.cta}
                  className="inline-flex items-center gap-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors group/link"
                >
                  {feature.ctaText}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

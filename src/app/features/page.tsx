"use client";

import Link from "next/link";
import HomeNavbar from "@/components/HomeNavbar";
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

export default function FeaturesPage() {
  const features = [
    {
      title: "Real-time Collaboration + Voice",
      description:
        "Collaborate with your team in real-time inside code rooms. Built-in voice calling lets you discuss changes without leaving the editor.",
      cta: "/rooms",
      ctaText: "Try Collaboration",
      icon: <Users className="w-8 h-8 text-cyan-300" />,
    },
    {
      title: "AI-Powered Development",
      description:
        "Use AI to explain code, suggest fixes, and autocomplete functions directly in your rooms. Speed up your workflow and reduce errors.",
      cta: "/rooms",
      ctaText: "Try AI Assistant",
      icon: <Cpu className="w-8 h-8 text-indigo-300" />,
    },
    {
      title: "Team & Room Management",
      description:
        "Create teams, add members, and manage rooms seamlessly. Keep your projects organized and your team in sync.",
      cta: "/teams",
      ctaText: "Manage Teams",
      icon: <Mic className="w-8 h-8 text-pink-300" />,
    },
    {
      title: "Multi-Language Support",
      description:
        "Code in JavaScript, Node.js, Python, Java, C/C++, and more. Switch between languages and runtimes effortlessly.",
      cta: "/rooms",
      ctaText: "Start Coding",
      icon: <Code2 className="w-8 h-8 text-green-300" />,
    },
    {
      title: "Version Control & Git-Style Commits",
      description:
        "Keep track of changes with Git-style commits, view file history, revert to previous versions, and collaborate safely.",
      cta: "/rooms",
      ctaText: "Explore Version Control",
      icon: <GitBranch className="w-8 h-8 text-yellow-300" />,
    },
    {
      title: "Download Projects",
      description:
        "Download all your project files in one click as a ZIP. Keep local copies of your work or share it outside CodeSphere effortlessly.",
      cta: "/rooms",
      ctaText: "Download Now",
      icon: <Download className="w-8 h-8 text-red-300" />,
    },
    {
      title: "Undo / Redo History",
      description:
        "Never lose work. Each file keeps a scoped undo-redo history, even across sessions.",
      cta: "/rooms",
      ctaText: "Try Undo/Redo",
      icon: <Undo2 className="w-8 h-8 text-purple-300" />,
    },
    {
      title: "Live Execution & Preview",
      description:
        "Instantly run your code in the cloud and preview results. Share live workspace links with teammates for easy collaboration.",
      cta: "/rooms",
      ctaText: "Run Code",
      icon: <PlayCircle className="w-8 h-8 text-cyan-400" />,
    },
    {
      title: "Scoped Dependencies & Previews",
      description:
        "Add libraries like Lodash, DayJS, UUID per room. Previews automatically load dependencies without breaking your workspace.",
      cta: "/rooms",
      ctaText: "Manage Dependencies",
      icon: <Boxes className="w-8 h-8 text-orange-300" />,
    },
  ];

  return (
    <div className="w-full bg-black text-white">
      <HomeNavbar />

      <main className="max-w-5xl mx-auto px-6 md:px-12 py-20 space-y-24">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r text-transparent bg-clip-text from-indigo-300 to-cyan-300 mb-4">
            Features
          </h1>
          <p className="text-gray-400 text-lg">
            Everything you need to code, collaborate, and ship faster — all in
            one online workspace.
          </p>
        </header>

        {features.map((feature, idx) => (
          <section
            key={idx}
            className={`w-full ${idx % 2 === 0 ? "text-left" : "text-right"}`}
          >
            <div className="flex flex-col gap-4 max-w-2xl mx-auto">
              <div
                className={`flex items-center gap-3 ${
                  idx % 2 === 0 ? "justify-start" : "justify-end"
                }`}
              >
                {feature.icon}
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight lg:leading-10 bg-gradient-to-r from-indigo-200 to-cyan-200 bg-clip-text text-transparent">
                  {feature.title}
                </h2>
              </div>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                {feature.description}
              </p>
              <div
                className={`flex ${
                  idx % 2 === 0 ? "justify-start" : "justify-end"
                }`}
              >
                <Link
                  href={feature.cta}
                  className="w-fit bg-black text-neutral-300 border border-neutral-300 rounded-lg flex items-center px-4 py-2 gap-2 mt-4 transition-all duration-300 hover:bg-white hover:text-black hover:border-white"
                >
                  {feature.ctaText} <ArrowRight />
                </Link>
              </div>
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}

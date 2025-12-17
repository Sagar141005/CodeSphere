"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { motion } from "motion/react";

const languages = [
  {
    id: "python",
    name: "Python",
    description:
      "A versatile high-level language popular for AI, data science, and web development.",
    extensions: [".py"],
    run: "python3 main.py",
    img: "/python.svg",
  },
  {
    id: "javascript",
    name: "JavaScript",
    description:
      "The language of the web. Supports both client-side and server-side development.",
    extensions: [".js"],
    run: "node main.js",
    img: "/js.svg",
  },
  {
    id: "node",
    name: "Node.js",
    description:
      "JavaScript runtime for building fast and scalable server-side applications.",
    extensions: [".js"],
    run: "node main.js",
    img: "/node.svg",
  },
  {
    id: "c-cpp",
    name: "C / C++",
    description:
      "Powerful low-level languages used for system programming and game development.",
    extensions: [".c", ".cpp"],
    run: "g++ main.cpp -o app && ./app",
    img: "/c++.svg",
  },
  {
    id: "java",
    name: "Java",
    description:
      "A robust, object-oriented language used for enterprise, Android, and backend systems.",
    extensions: [".java"],
    run: "javac Main.java && java Main",
    img: "/java.svg",
  },
  {
    id: "html",
    name: "HTML",
    description:
      "The standard markup language for creating web pages and applications.",
    extensions: [".html"],
    run: "open index.html",
    img: "/html.svg",
  },
  {
    id: "css",
    name: "CSS",
    description:
      "Style sheet language used for designing visually engaging web pages.",
    extensions: [".css"],
    run: "open index.html",
    img: "/css.svg",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function LanguagesPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <HomeNavbar />

      <main className="relative pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-24">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter text-neutral-50 mb-6"
            >
              Speak the language <br />
              <span className="text-neutral-500">of your choice.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-neutral-400 leading-relaxed max-w-xl mx-auto"
            >
              CodeSphere creates an isolated container for every room. Compile,
              debug, and run instantly without local setup.
            </motion.p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {languages.map((lang) => (
              <motion.div
                key={lang.id}
                variants={item}
                className="group relative flex flex-col p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 transition-all duration-300 hover:border-neutral-700 hover:shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <img src={lang.img} className="size-6" />
                  <h2 className="text-xl font-bold tracking-tight">
                    {lang.name}
                  </h2>
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed mb-4 flex-grow">
                  {lang.description}
                </p>
                <p className="text-xs font-mono text-neutral-400">
                  <strong>Extensions:</strong> {lang.extensions.join(", ")}
                </p>
                <p className="text-xs font-mono text-neutral-300">
                  <strong>Run Command:</strong> {lang.run}
                </p>
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-neutral-800/50 pointer-events-none transition-colors" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

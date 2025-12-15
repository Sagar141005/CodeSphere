"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { Plus } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "How do I create a new project?",
    answer:
      "Click on 'New Room' from your dashboard, give it a name, select a language, and start coding instantly. No setup required.",
  },
  {
    question: "Which programming languages are supported?",
    answer:
      "CodeSphere supports JavaScript, Node.js, Python, C/C++, and Java with live execution and preview.",
  },
  {
    question: "Can I collaborate with my team in real-time?",
    answer:
      "Yes! Multiple users can edit the same room simultaneously. Every change is synced in real-time, with version history and diff previews.",
  },
  {
    question: "Can I download my project files?",
    answer:
      "Yes! You can download all files in your project as a single ZIP file with one click. This makes it easy to backup or share your work outside CodeSphere.",
  },
  {
    question: "Does CodeSphere support AI-assisted coding?",
    answer:
      "Absolutely! You can use the AI assistant to explain code, generate snippets, debug, and get suggestions while you code.",
  },
  {
    question: "Can I call or chat with my team?",
    answer:
      "Yes, we have integrated voice calling and chat features for smooth collaboration directly inside the editor.",
  },
  {
    question: "How do I manage dependencies?",
    answer:
      "You can add external dependencies via our interface. For JavaScript projects, a `package.json` is generated automatically.",
  },
  {
    question: "Can I use version control like Git?",
    answer:
      "Yes! CodeSphere has a built-in Git-style version control system with commits, revert functionality, and GitHub export support.",
  },
  {
    question: "Is my data secure?",
    answer:
      "All your code and project data is stored securely in the cloud. Rooms are scoped by teams and private by default.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <HomeNavbar />

      <main className="relative pt-24 pb-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
          <header className="text-center mb-20">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold tracking-tighter text-neutral-50 mb-6"
            >
              Common Questions
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-neutral-400 max-w-lg mx-auto leading-relaxed"
            >
              Everything you need to know about the product, billing, and
              technical capabilities.
            </motion.p>
          </header>

          <section className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.05 }}
                  className={`group rounded-xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "bg-neutral-900 border-neutral-700 shadow-2xl"
                      : "bg-neutral-900/30 border-neutral-800 hover:border-neutral-700"
                  }`}
                >
                  <button
                    onClick={() => toggle(idx)}
                    className="flex justify-between items-center w-full p-6 text-left focus:outline-none"
                  >
                    <span
                      className={`text-lg font-medium transition-colors ${
                        isOpen
                          ? "text-neutral-50"
                          : "text-neutral-300 group-hover:text-neutral-100"
                      }`}
                    >
                      {faq.question}
                    </span>

                    <div
                      className={`relative flex items-center justify-center w-8 h-8 rounded-lg border transition-all duration-300 ${
                        isOpen
                          ? "bg-neutral-50 border-neutral-50 text-neutral-950"
                          : "bg-transparent border-neutral-800 text-neutral-500 group-hover:border-neutral-600"
                      }`}
                    >
                      <motion.div
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      >
                        <Plus className="w-5 h-5" />
                      </motion.div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.04, 0.62, 0.23, 0.98],
                        }}
                      >
                        <div className="px-6 pb-6 pt-0">
                          <p className="text-neutral-400 leading-relaxed text-base border-t border-neutral-800/50 pt-4">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </section>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-20"
          >
            <p className="text-sm text-neutral-500">
              Still have questions?{" "}
              <a
                href="/contact"
                className="text-neutral-200 hover:underline hover:text-white transition-colors"
              >
                Contact our support team
              </a>
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

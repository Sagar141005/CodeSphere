"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/HomeNavbar";
import { Plus, X } from "lucide-react";
import { useState } from "react";

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
    <div className="w-full bg-black text-white">
      <HomeNavbar />

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-20 space-y-20">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r text-transparent bg-clip-text from-indigo-300 to-cyan-300 mb-4">
            FAQ
          </h1>
          <p className="text-gray-400 text-lg">
            Answers to the most common questions about CodeSphere, coding,
            collaboration, and AI-assisted development.
          </p>
        </header>

        <section className="max-w-4xl mx-auto space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border border-neutral-800 bg-neutral-900 hover:border-indigo-400 transition cursor-pointer"
              onClick={() => toggle(idx)}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{faq.question}</h2>
                <span className="text-indigo-400">
                  {openIndex === idx ? (
                    <X className="size-5" />
                  ) : (
                    <Plus className="size-5" />
                  )}
                </span>
              </div>
              {openIndex === idx && (
                <p className="text-gray-400 mt-4">{faq.answer}</p>
              )}
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}

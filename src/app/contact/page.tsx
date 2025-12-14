"use client";

import Link from "next/link";
import HomeNavbar from "@/components/home/HomeNavbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Send, Mail, User, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <HomeNavbar />

      <main className="relative pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <header className="text-center max-w-2xl mx-auto mb-20">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold tracking-tighter text-neutral-50 mb-6"
            >
              Get in touch.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-neutral-400 leading-relaxed"
            >
              Have questions about enterprise deployments, custom integrations,
              or just want to say hello? We're ready to listen.
            </motion.p>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto"
          >
            <form className="space-y-6">
              <div className="group relative">
                <div className="absolute left-4 top-3.5 text-neutral-500 group-focus-within:text-neutral-200 transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 focus:bg-neutral-900 transition-all duration-300"
                />
              </div>

              <div className="group relative">
                <div className="absolute left-4 top-3.5 text-neutral-500 group-focus-within:text-neutral-200 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="name@company.com"
                  className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 focus:bg-neutral-900 transition-all duration-300"
                />
              </div>

              <div className="group relative">
                <div className="absolute left-4 top-3.5 text-neutral-500 group-focus-within:text-neutral-200 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <textarea
                  rows={5}
                  placeholder="How can we help?"
                  className="w-full bg-neutral-900/50 border border-neutral-800 rounded-xl py-3 pl-12 pr-4 text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500 focus:bg-neutral-900 transition-all duration-300 resize-none"
                />
              </div>

              <button className="w-full group relative flex items-center justify-center gap-2 bg-neutral-50 hover:bg-white text-neutral-950 font-bold py-3 rounded-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]">
                <span>Send Message</span>
                <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>

              <p className="text-center text-xs text-neutral-600 mt-4">
                We typically respond within 24 hours during business days.
              </p>
            </form>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <HomeNavbar />

      <main className="relative pt-24 pb-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 relative z-10">
          <header className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
                Last updated: August 2025
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold tracking-tighter text-center text-neutral-50 mb-6"
            >
              Privacy Policy
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-neutral-400 leading-relaxed text-center"
            >
              Your privacy is non-negotiable. This document outlines exactly how
              CodeSphere collects, processes, and secures your data.
            </motion.p>
          </header>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-12"
          >
            <PolicySection
              number="01"
              title="Information We Collect"
              content="We collect only what is necessary to provide our service. This includes account credentials (email, username), project files stored in your workspaces, and anonymized usage telemetry to improve platform stability."
            />

            <PolicySection
              number="02"
              title="How We Use Information"
              content="Your data powers the core CodeSphere experience: real-time synchronization, cloud storage, and AI code generation. We do not sell your personal data to advertisers or third parties."
            />

            <PolicySection
              number="03"
              title="Data Security"
              content="We employ enterprise-grade encryption for data at rest (AES-256) and in transit (TLS 1.3). While we implement rigorous security protocols, no cloud service can guarantee absolute immunity from threats."
            />

            <PolicySection
              number="04"
              title="Third-Party Processors"
              content="We partner with trusted infrastructure providers (e.g., AWS, OpenAI) to deliver hosting and AI services. These partners adhere to strict data processing agreements compliant with GDPR and CCPA."
            />

            <PolicySection
              number="05"
              title="Your Rights"
              content="You retain full ownership of your code. You may export your projects, correct personal information, or request permanent account deletion at any time via your account settings."
            />
          </motion.div>

          <div className="mt-20 pt-10 border-t border-neutral-900 text-center">
            <p className="text-neutral-500 text-sm">
              Questions about this policy? Contact our Data Protection Officer
              at{" "}
              <a
                href="mailto:privacy@codesphere.com"
                className="text-neutral-300 hover:text-white hover:underline decoration-neutral-700 underline-offset-4 transition-colors"
              >
                privacy@codesphere.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PolicySection({
  number,
  title,
  content,
}: {
  number: string;
  title: string;
  content: string;
}) {
  return (
    <div className="group">
      <h2 className="text-xl font-bold text-neutral-50 mb-4 flex items-center gap-3">
        <span className="font-mono text-sm text-neutral-600 group-hover:text-neutral-400 transition-colors">
          {number}.
        </span>
        {title}
      </h2>
      <p className="text-neutral-400 leading-7 text-base md:text-lg">
        {content}
      </p>
    </div>
  );
}

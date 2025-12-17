"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/home/HomeNavbar";
import { motion } from "motion/react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <HomeNavbar />

      <main className="relative pt-24 pb-32">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10">
          <header className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <span className="font-mono text-xs text-neutral-500 uppercase tracking-widest">
                Effective Date: August 2025
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold tracking-tighter text-center text-neutral-50 mb-6"
            >
              Terms & Conditions
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-neutral-400 text-center leading-relaxed"
            >
              <p>
                Please read these terms carefully before deploying on
                CodeSphere. By accessing or using our platform, you agree to be
                bound by these conditions.
              </p>
            </motion.div>
          </header>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-12"
          >
            <TermSection
              number="01"
              title="Acceptance of Terms"
              content="By creating an account or using CodeSphere, you formally agree to these Terms & Conditions and our Privacy Policy. If you do not agree, you must discontinue use of our services immediately."
            />

            <TermSection
              number="02"
              title="Use of the Platform"
              content="CodeSphere is a professional tool for code collaboration. You agree not to misuse the platform for illegal activities, malware distribution, or unauthorized system disruption (DDoS). We reserve the right to monitor usage for security purposes."
            />

            <TermSection
              number="03"
              title="User Accounts"
              content="You are responsible for safeguarding your access credentials. CodeSphere is not liable for any loss or damage arising from your failure to protect your account information."
            />

            <TermSection
              number="04"
              title="User Content & IP"
              content="You retain full ownership of the code you write on CodeSphere. However, you grant us a limited, worldwide license to host, run, and display your content solely for the purpose of providing the service."
            />

            <TermSection
              number="05"
              title="Platform Intellectual Property"
              content="The CodeSphere interface, logos, and proprietary code execution engine are the exclusive property of CodeSphere Inc. You may not reverse engineer or resell any part of the service."
            />

            <TermSection
              number="06"
              title="Termination"
              content="We reserve the right to suspend or terminate your access immediately, without prior notice, if you breach these Terms. You may also voluntarily terminate your account via settings at any time."
            />

            <TermSection
              number="07"
              title="Limitation of Liability"
              content='THE SERVICE IS PROVIDED "AS IS". CODESPHERE DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED. WE ARE NOT LIABLE FOR DATA LOSS, DOWNTIME, OR DAMAGES RESULTING FROM THE USE OF OUR PLATFORM.'
            />

            <TermSection
              number="08"
              title="Modifications"
              content="We may revise these Terms from time to time. The most current version will always be posted on this page. By continuing to use the App after revisions become effective, you agree to be bound by the revised Terms."
            />

            <TermSection
              number="09"
              title="Governing Law"
              content="These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which CodeSphere Inc. is registered, without regard to its conflict of law provisions."
            />
          </motion.div>

          <div className="mt-24 pt-10 border-t border-neutral-900 text-center">
            <p className="text-neutral-500 text-sm">
              Legal inquiries?{" "}
              <a
                href="mailto:legal@codesphere.com"
                className="text-neutral-300 hover:text-white hover:underline decoration-neutral-700 underline-offset-4 transition-colors"
              >
                legal@codesphere.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TermSection({
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

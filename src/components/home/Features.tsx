"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Globe, CheckCircle2, Mic, Laptop, WandSparkles } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="relative w-full py-24 bg-neutral-950 text-neutral-50 overflow-hidden">
      <div className="flex flex-col items-center px-6 lg:px-8 mb-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative group w-full max-w-5xl"
        >
          <div className="absolute -inset-1 bg-gradient-to-b from-neutral-800 to-transparent rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />

          <img
            src="home1.webp"
            className="relative w-full rounded-xl border border-neutral-800 shadow-2xl bg-neutral-900"
            alt="Editor Interface"
            loading="lazy"
          />
        </motion.div>

        <div className="relative flex flex-col items-center text-center max-w-3xl mt-16 space-y-6">
          <span className="px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900 text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Real-time Collaboration
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-neutral-200 leading-tight">
            Execute your code in{" "}
            <span className="text-neutral-50 font-bold">multiple runtimes</span>
            . Preview results and share a live workspace instantly.
          </h2>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-px -ml-[0.5px] bg-neutral-800 h-full">
          <ScrollProgressLine />
        </div>

        <div className="flex flex-col gap-24 lg:gap-40 relative z-10">
          <FeatureRow
            number="01"
            title="Anywhere & Anytime"
            desc="Create and manage your projects directly in the browser — no local setup required. Real-time sync and change history so your whole team always stays in context."
            icon={<Globe />}
            features={[
              "Zero-setup online editor",
              "Live preview & version control",
            ]}
            align="left"
          />

          <FeatureRow
            number="02"
            title="Live Collaboration + Voice"
            desc="Jump on a built-in voice call right inside your coding room. Discuss changes, share insights, and ship faster without juggling tools."
            icon={<Mic />}
            features={["Real-time multi-user editing", "Built-in voice rooms"]}
            align="right"
          />

          <FeatureRow
            number="03"
            title="Work Anywhere"
            desc="Your sessions run in the cloud and can be resumed from any browser at any time."
            icon={<Laptop />}
            features={["Cloud-based workspaces", "Resume sessions instantly"]}
            align="left"
          />

          <FeatureRow
            number="04"
            title="AI-Powered Development"
            desc="Let AI speed up your workflow — get instant code explanations, fix errors, and autocomplete functions without leaving your room."
            icon={<WandSparkles />}
            features={["AI debugging & explanations", "Smart autocomplete"]}
            align="right"
          />
        </div>
      </div>
    </section>
  );
}

function ScrollProgressLine() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const height = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <motion.div
      ref={ref}
      style={{ height }}
      className="w-full bg-gradient-to-b from-neutral-50 via-neutral-200 to-transparent shadow-[0_0_15px_rgba(255,255,255,0.4)]"
    />
  );
}

function FeatureRow({
  number,
  title,
  desc,
  icon,
  features,
  align = "left",
}: {
  number: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  features: string[];
  align?: "left" | "right";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-center"
    >
      {/* spacer */}
      <div
        className={`hidden lg:block ${
          align === "left" ? "order-3" : "order-1"
        }`}
      />

      {/* timeline dot */}
      <div className="relative flex md:justify-center justify-start -ml-7 md:ml-0 order-1 lg:order-2">
        <div className="relative w-10 h-10 flex items-center justify-center bg-neutral-950 border border-neutral-700 rounded-full z-10 shadow-xl">
          <div className="w-3 h-3 bg-neutral-50 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
        </div>
      </div>

      {/* content */}
      <div
        className={`flex flex-col space-y-6 pl-12 lg:pl-0 ${
          align === "left"
            ? "order-2 lg:order-1 lg:text-right lg:items-end"
            : "order-2 lg:order-3 lg:text-left lg:items-start"
        }`}
      >
        <div
          className={`flex items-center gap-4 ${
            align === "left" ? "lg:flex-row-reverse" : "lg:flex-row"
          }`}
        >
          <span className="text-6xl font-bold text-neutral-800 opacity-50 select-none">
            {number}
          </span>
          <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-neutral-50 shadow-sm">
            {icon}
          </div>
        </div>

        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-neutral-100 mb-3">
            {title}
          </h3>
          <p className="text-neutral-400 leading-relaxed max-w-md">{desc}</p>
        </div>

        <ul
          className={`flex flex-col gap-2 text-sm font-medium ${
            align === "left" ? "items-end" : "items-start"
          }`}
        >
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-neutral-500">
              {align === "left" && <span>{feature}</span>}
              <CheckCircle2 className="w-4 h-4 text-neutral-600" />
              {align === "right" && <span>{feature}</span>}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

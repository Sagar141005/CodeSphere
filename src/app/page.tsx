"use client";

import HomeNavbar from "@/components/HomeNavbar";
import { ArrowRight, Facebook, Github, Instagram } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full bg-black text-white">
      <HomeNavbar />
      <div className="w-full h-screen">
        <div className="flex items-center justify-between pt-12 px-10">
          <div>
            {["Code.", "Collaborate.", "Preview."].map((word) => (
              <h1
                key={word}
                className="text-9xl font-semibold bg-gradient-to-r text-transparent bg-clip-text from-indigo-300 to-cyan-300 transition-all duration-300 hover:brightness-125"
              >
                {word}
              </h1>
            ))}
          </div>
        </div>

        <div className="h-40 flex flex-col items-center text-center px-10 mt-24">
          <h1 className="font-semibold text-gray-400">
            TRUSTED BY DEVELOPERS WORLDWIDE
          </h1>
          <div className="w-full overflow-hidden mt-8">
            <div className="scroll-wrapper">
              <div className="scroll-horizontal">
                {[...Array(2)].map((_, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex items-center gap-12 pr-12"
                  >
                    {[
                      "Google",
                      "Adobe",
                      "Airbnb",
                      "Spotify",
                      "Meta",
                      "Microsoft",
                      "Netflix",
                      "Tesla",
                    ].map((company, i) => (
                      <img
                        key={`${rowIndex}-${i}`}
                        loading="lazy"
                        src={`/${company}.svg`}
                        alt={company}
                        className="logo-img grayscale brightness-75 transition-transform duration-300 hover:grayscale-0 hover:scale-105"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full h-screen bg-black flex flex-col items-center gap-12">
        <img
          src="landing1.png"
          className="w-4xl rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
          alt=""
        />
        <div className="flex flex-col items-center text-center">
          <h4 className="text-gray-400 text-sm font-semibold uppercase">
            Build & preview in real-time
          </h4>
          <h2 className="text-xl font-medium text-neutral-200">
            Execute your code in multiple supported runtimes — <br />
            instantly preview results and share a live workspace link with your
            teammates.
          </h2>
        </div>
      </div>
      {/* Feature Section 1 */}
      <div className="w-full min-h-96 bg-[#1A1A1A] flex items-center justify-between gap-12 px-10 py-12">
        <div className="flex flex-col gap-5 text-left max-w-md">
          <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wide">
            Anywhere & Anytime
          </h4>
          <h2 className="text-4xl text-white font-bold leading-10">
            Zero-setup online editor with <br /> version control and live
            preview
          </h2>
          <p className="text-gray-400 text-md leading-relaxed">
            Create and manage your projects directly in the browser — no local
            setup required.
          </p>
          <p className="text-gray-400 text-md leading-relaxed">
            Real-time sync and change history so your whole team always stays in
            context.
          </p>

          <Link
            href="/rooms"
            className="w-fit bg-black text-neutral-300 border border-neutral-300 rounded-lg flex items-center px-4 py-2 gap-2 mt-6 transition-all duration-300 hover:bg-neutral-300 hover:text-black"
          >
            Open Web Editor <ArrowRight />
          </Link>
        </div>
        <div>
          <img
            src="landing1.png"
            className="w-3xl rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
            alt=""
          />
        </div>
      </div>

      {/* Feature Section 2 */}
      <div className="w-full min-h-96 bg-[#739CFC] text-black flex items-center justify-between gap-12 px-10 py-12">
        <div>
          <img
            src="landing1.png"
            className="w-3xl rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
            alt=""
          />
        </div>
        <div className="flex flex-col gap-5 text-left max-w-md">
          <h4 className="text-xs font-semibold uppercase text-black tracking-wide">
            Work Anywhere
          </h4>
          <h2 className="text-4xl font-bold leading-10">
            Access your code workspaces <br /> from any device
          </h2>
          <p className="text-md leading-relaxed">
            Your sessions run in the cloud and can be resumed from any browser
            at any time.
          </p>

          <Link
            href="/rooms"
            className="w-fit bg-black text-neutral-300 border border-black rounded-lg flex items-center px-4 py-2 gap-2 mt-6 transition-all duration-300 hover:bg-white hover:text-black hover:border-white"
          >
            Continue Coding <ArrowRight />
          </Link>
        </div>
      </div>

      {/* Feature Section 3 */}
      <div className="w-full min-h-96 bg-[#8ADC79] text-black flex items-center justify-between gap-12 px-10 py-12">
        <div className="flex flex-col gap-5 text-left max-w-md">
          <h4 className="text-xs font-semibold uppercase text-black tracking-wide">
            Live Collaboration
          </h4>
          <h2 className="text-4xl font-bold leading-10">
            Collaborate with developers <br /> in real-time
          </h2>
          <p className="text-md leading-relaxed">
            Multiple users can edit and preview code together with full version
            history and diff previews.
          </p>

          <Link
            href="/rooms"
            className="w-fit bg-black text-neutral-300 border border-black rounded-lg flex items-center px-4 py-2 gap-2 mt-6 transition-all duration-300 hover:bg-white hover:text-black hover:border-white"
          >
            Try Collaboration <ArrowRight />
          </Link>
        </div>
        <div>
          <img
            src="landing1.png"
            className="w-3xl rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
            alt=""
          />
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="w-full min-h-screen bg-black">
        <div className="flex flex-col items-center gap-8 pt-32">
          <h4 className="text-sm font-semibold uppercase -mb-2">
            Easy to start
          </h4>
          <h1 className="text-8xl font-semibold text-center">
            Code directly <br /> in the cloud with{" "}
            <span className="bg-gradient-to-r text-transparent bg-clip-text from-indigo-300 to-cyan-300">
              CodeSphere
            </span>
          </h1>
          <div className="flex items-center gap-3 mt-4">
            {["html", "css", "js", "node", "python", "java", "c++"].map(
              (lang) => (
                <img
                  key={lang}
                  src={`${lang}.svg`}
                  alt={lang}
                  className="w-12 bg-[#1A1A1A] rounded-md p-2 transition-transform duration-200 hover:scale-110"
                />
              )
            )}
          </div>
        </div>

        <div className="mt-24 px-10">
          <h2 className="text-4xl font-medium">
            Start coding with{" "}
            <span className="bg-gradient-to-r text-transparent bg-clip-text from-indigo-300 to-cyan-300">
              one click
            </span>{" "}
            — no setup required
          </h2>
          <div className="relative flex items-center justify-around mt-12">
            <img
              src="landing1.png"
              alt=""
              className="w-4xl relative z-10 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute -bottom-2 w-3xl h-96 rounded-full z-0 bg-gradient-to-b from-cyan-200 to-cyan-400 blur-3xl" />
          </div>
        </div>

        {/* Final CTA Banner */}
        <div className="mt-36 bg-gradient-to-r from-indigo-200/80 to-cyan-300 text-black flex items-center justify-between px-10 py-12">
          <div className="flex flex-col justify-center gap-4">
            <h2 className="text-6xl font-semibold">
              The simplest way <br /> to build & collaborate <br /> on code
              online.
            </h2>
            <h4 className="text-sm font-medium">
              Cloud environment + real-time collaboration + version history in
              one dashboard.
            </h4>
            <Link
              href="/rooms"
              className="w-fit bg-black text-neutral-300 rounded-lg flex items-center px-4 py-2 gap-2 mt-6 transition-all duration-300 hover:bg-white hover:text-black"
            >
              Try now — it's free <ArrowRight />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-[#1A1A1A] px-10 py-12 text-neutral-300 flex flex-col gap-12">
          {/* Top Section */}
          <div className="flex justify-between items-start gap-16">
            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {[Instagram, Github, Facebook].map((Icon, i) => (
                <div
                  key={i}
                  className="group size-10 p-2 rounded-full border border-neutral-500 hover:bg-gradient-to-r from-indigo-300 to-cyan-300 transition-all duration-300 cursor-pointer"
                >
                  <Icon className="w-full h-full text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
              ))}
            </div>

            {/* Footer Links */}
            <div className="flex gap-16">
              {/* Features */}
              <div className="flex flex-col gap-2">
                <h4 className="text-white text-md font-semibold mb-1">
                  Features
                </h4>
                {[
                  "Real-time collaboration",
                  "Version history",
                  "Diff previews",
                  "Live execution",
                ].map((item, idx) => (
                  <p
                    key={idx}
                    className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    {item}
                  </p>
                ))}
              </div>

              {/* Languages */}
              <div className="flex flex-col gap-2">
                <h4 className="text-white text-md font-semibold mb-1">
                  Supported languages
                </h4>
                {["JavaScript / Node.js", "Python", "C / C++", "Java"].map(
                  (lang, idx) => (
                    <p
                      key={idx}
                      className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 cursor-pointer"
                    >
                      {lang}
                    </p>
                  )
                )}
              </div>

              {/* About */}
              <div className="flex flex-col gap-2">
                <h4 className="text-white text-md font-semibold mb-1">About</h4>
                {["Contact", "Support", "Roadmap"].map((item, idx) => (
                  <p
                    key={idx}
                    className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex items-center justify-between pt-6 border-t border-neutral-800">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} CodeSphere. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Terms and Conditions", "Privacy Policy"].map((item, idx) => (
                <p
                  key={idx}
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

"use client";

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/HomeNavbar";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full bg-black text-white">
      <HomeNavbar />

<<<<<<< HEAD
      <div className="relative w-full min-h-[50vh] sm:min-h-[70vh] lg:min-h-screen flex flex-col justify-start pt-30 sm:pt-24 lg:pt-40 px-6 lg:px-10 bg-black overflow-hidden">
=======
      {/* Hero Section */}
      <div className="relative w-full min-h-[50vh] sm:min-h-[70vh] lg:min-h-screen flex flex-col justify-start pt-30 sm:pt-24 lg:pt-40 px-6 lg:px-10 bg-black overflow-hidden">
        {/* Pattern Layer with Side Blur */}
>>>>>>> 597aadb087aa90d0b3ba7b75a23942033869f7f2
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='%23333236' fill-opacity='0.3'%3E%3Cpolygon fill-rule='evenodd' points='8 4 12 6 8 8 6 12 4 8 0 6 4 4 6 0 8 4'/%3E%3C/g%3E%3C/svg%3E\")",
            backgroundColor: "#000000",
            backgroundSize: "40px 40px",
            filter: "blur(2px)",
            maskImage: `radial-gradient(circle at center, black 60%, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(circle at center, black 60%, transparent 100%)`,
          }}
        />

<<<<<<< HEAD
=======
        {/* Main Content Layer */}
>>>>>>> 597aadb087aa90d0b3ba7b75a23942033869f7f2
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div>
              {["Code.", "Collaborate.", "Preview."].map((word) => (
                <h1
                  key={word}
                  className="text-5xl sm:text-8xl lg:text-9xl font-semibold bg-gradient-to-r text-transparent bg-clip-text from-indigo-300 to-cyan-300 transition-all duration-300 hover:brightness-125 text-center lg:text-left"
                >
                  {word}
                </h1>
              ))}
            </div>
          </div>

<<<<<<< HEAD
=======
          {/* Trusted By */}
>>>>>>> 597aadb087aa90d0b3ba7b75a23942033869f7f2
          <div className="h-auto flex flex-col items-center text-center px-6 lg:px-10 mt-12 sm:mt-16 lg:mt-24">
            <h1 className="font-semibold text-gray-400 text-sm sm:text-base">
              TRUSTED BY DEVELOPERS WORLDWIDE
            </h1>
            <div className="w-full overflow-hidden mt-6 lg:mt-8">
              <div className="scroll-wrapper">
                <div className="scroll-horizontal">
                  {[...Array(2)].map((_, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="flex items-center gap-6 sm:gap-12 pr-6 sm:pr-12"
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
                          className="h-5 sm:h-8 lg:h-10 logo-img grayscale brightness-75 transition-transform duration-300 hover:grayscale-0 hover:scale-105"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* First Feature Section */}
      <div className="relative w-full bg-black flex flex-col gap-6 sm:gap-8 lg:gap-12 items-center justify-center px-6 lg:px-10 py-14 sm:py-16 lg:py-20">
<<<<<<< HEAD
=======
        {/* Pattern overlay */}
>>>>>>> 597aadb087aa90d0b3ba7b75a23942033869f7f2
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='%23333236' fill-opacity='0.3'%3E%3Cpolygon fill-rule='evenodd' points='8 4 12 6 8 8 6 12 4 8 0 6 4 4 6 0 8 4'/%3E%3C/g%3E%3C/svg%3E\")",
            backgroundSize: "40px 40px",
            filter: "blur(2px)",
            maskImage:
              "radial-gradient(circle at 50% 75%, black 60%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(circle at 50% 75%, black 60%, transparent 100%)",
            maskComposite: "intersect",
            WebkitMaskComposite: "destination-in",
          }}
        ></div>
<<<<<<< HEAD
=======

        {/* Content */}
>>>>>>> 597aadb087aa90d0b3ba7b75a23942033869f7f2
        <img
          src="home1.webp"
          className="relative w-full max-w-xl sm:max-w-2xl lg:max-w-4xl rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
          alt="Editor"
          loading="lazy"
        />
        <div className="relative flex flex-col items-center text-center max-w-2xl">
          <h4 className="text-gray-400 text-xs sm:text-sm font-semibold uppercase">
            Build & preview in real-time
          </h4>
          <h2 className="text-sm sm:text-lg lg:text-xl font-medium text-neutral-200">
            Execute your code in multiple supported runtimes — <br />
            instantly preview results and share a live workspace link with your
            teammates.
          </h2>
        </div>
      </div>

      {/* Feature Section 1 */}
      <div className="w-full min-h-96 bg-[#1A1A1A] flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 px-6 lg:px-10 py-12">
        <div className="flex flex-col gap-4 text-left max-w-md">
          <h4 className="text-xs font-semibold uppercase text-gray-400 tracking-wide">
            Anywhere & Anytime
          </h4>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl text-white font-bold leading-tight lg:leading-10">
            Zero-setup online editor with <br /> version control and live
            preview
          </h2>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Create and manage your projects directly in the browser — no local
            setup required.
          </p>
          <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
            Real-time sync and change history so your whole team always stays in
            context.
          </p>
        </div>
        <div>
          <img
            src="home2.webp"
            className="hidden lg:block w-full sm:w-3xl lg:w-3xl rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
            alt="Preview modal"
            loading="lazy"
          />
        </div>
      </div>

      {/* Feature Section 2 */}
      <div className="relative w-full min-h-96 bg-[#6FB1FC] text-black flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 px-6 lg:px-10 py-12">
        <div>
          <img
            src="home4.webp"
            className="hidden lg:block lg:absolute lg:-left-90 lg:top-25 w-full sm:w-3xl lg:w-3xl rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 clip-bottom-cut1"
            alt="Voice chat"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col gap-4 text-left max-w-md lg:max-w-3xl lg:pr-72">
          <h4 className="text-xs font-semibold uppercase text-black tracking-wide">
            Live Collaboration + Voice
          </h4>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight lg:leading-10">
            Talk and code together — in real-time
          </h2>
          <p className="text-sm sm:text-base leading-relaxed">
            Jump on a built-in voice call right inside your coding room. Discuss
            changes, share insights, and ship faster without juggling tools.
          </p>
        </div>
      </div>

      {/* Feature Section 3 */}
      <div className="w-full min-h-96 bg-[#7FDBB6] text-black flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 px-6 lg:px-10 py-12">
        <div className="flex flex-col gap-4 text-left max-w-md">
          <h4 className="text-xs font-semibold uppercase text-black tracking-wide">
            Work Anywhere
          </h4>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight lg:leading-10">
            Access your code workspaces <br /> from any device
          </h2>
          <p className="text-sm sm:text-base leading-relaxed">
            Your sessions run in the cloud and can be resumed from any browser
            at any time.
          </p>
        </div>
        <div>
          <img
            src="home3.webp"
            className="hidden lg:block w-full sm:w-3xl lg:w-3xl rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
            alt="Rooms"
            loading="lazy"
          />
        </div>
      </div>

      {/* Feature Section 4 */}
      <div className="relative w-full min-h-96 bg-[#FFC66D] text-black flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 px-6 lg:px-10 py-20">
        <div>
          <img
            src="home5.webp"
            alt="AI assistant"
            loading="lazy"
            className="hidden lg:block lg:absolute lg:-left-90 lg:top-30 w-full sm:w-3xl lg:w-3xl rounded-xl shadow-lg transition-transform duration-300 hover:scale-105 clip-bottom-cut2"
          />
        </div>
        <div className="flex flex-col gap-4 text-left max-w-md lg:max-w-3xl lg:pr-72">
          <h4 className="text-xs font-semibold uppercase tracking-wide">
            AI-Powered Development
          </h4>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight lg:leading-10">
            Debug, explain, and autocomplete <br /> with AI built-in
          </h2>
          <p className="text-sm sm:text-base leading-relaxed">
            Let AI speed up your workflow — get instant code explanations, fix
            errors, and autocomplete functions without leaving your room.
          </p>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="w-full min-h-screen bg-black">
        <div className="flex flex-col items-center gap-6 pt-20 px-4">
          <h4 className="text-xs sm:text-sm font-semibold uppercase -mb-1">
            Easy to start
          </h4>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-semibold text-center">
            Code directly <br /> in the cloud with{" "}
            <span className="bg-gradient-to-r text-transparent bg-clip-text from-indigo-300 to-cyan-300">
              CodeSphere
            </span>
          </h1>

          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {["html", "css", "js", "node", "python", "java", "c++"].map(
              (lang) => (
                <img
                  key={lang}
                  src={`${lang}.svg`}
                  alt={lang}
                  loading="lazy"
                  className="w-10 sm:w-12 bg-[#1A1A1A] rounded-md p-2 transition-transform duration-200 hover:scale-110"
                />
              )
            )}
          </div>
        </div>

        <div className="mt-16 sm:mt-24 px-4 sm:px-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-medium text-center md:text-left">
            Explore your code in{" "}
            <span className="bg-gradient-to-r text-transparent bg-clip-text from-indigo-300 to-cyan-300">
              different editor themes
            </span>{" "}
            — with theme options designed for every workflow
          </h2>
          <div className="relative flex flex-col md:flex-row items-center justify-center md:justify-around mt-8 sm:mt-12">
            <img
              src="home6.webp"
              alt="Editor themes"
              loading="lazy"
              className="w-full max-w-sm sm:max-w-lg md:max-w-3xl relative z-10 rounded-xl shadow-lg transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute -bottom-2 w-3/4 md:w-xl h-20 sm:h-64 md:h-60 rounded-full z-0 bg-gradient-to-r from-indigo-200 to-cyan-400 blur-3xl" />
          </div>
        </div>

        {/* Final CTA Banner */}
        <div className="mt-20 sm:mt-36 bg-gradient-to-r from-indigo-200/80 to-cyan-300 text-black flex flex-col md:flex-row items-center justify-between gap-8 px-6 sm:px-10 py-10 sm:py-12">
          <div className="flex flex-col justify-center gap-4 text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold">
              The simplest way <br className="hidden sm:block" /> to build &
              collaborate <br className="hidden sm:block" /> on code online.
            </h2>
            <h4 className="text-xs sm:text-sm font-medium">
              Cloud environment + real-time collaboration + version history in
              one dashboard.
            </h4>
            <Link
              href="/rooms"
              className="mx-auto md:mx-0 w-fit bg-black text-neutral-300 rounded-lg flex items-center px-4 py-2 gap-2 mt-4 sm:mt-6 transition-all duration-300 hover:bg-white hover:text-black"
            >
              Try now — it's free <ArrowRight />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

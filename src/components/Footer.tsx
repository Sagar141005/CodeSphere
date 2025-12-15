"use client";

import { Github, Twitter, SquareDashedBottomCode } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const socials = [
    {
      href: "https://github.com/Sagar141005",
      icon: Github,
    },
    {
      href: "https://x.com/not_sagar1410",
      icon: Twitter,
    },
  ];

  return (
    <footer className="relative bg-neutral-950 border-t border-neutral-800 px-6 sm:px-10 py-12 sm:py-16 text-neutral-400 flex flex-col gap-12 overflow-hidden">
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        aria-hidden="true"
      >
        <div
          className="absolute -inset-[100%] top-[-100%] h-[300%] w-[300%]"
          style={{
            backgroundSize: "40px 40px",
            backgroundImage: `
              linear-gradient(to right, #333 1px, transparent 1px),
              linear-gradient(to bottom, #333 1px, transparent 1px)
            `,
            transform:
              "perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)",
            maskImage:
              "radial-gradient(circle at center, black 0%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(circle at center, black 0%, transparent 70%)",
          }}
        />
      </div>
      <div className="w-full max-w-7xl mx-auto">
        <div className="relative z-10 flex flex-col gap-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-16">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 select-none">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-50 shadow-sm">
                  <SquareDashedBottomCode className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold text-neutral-50 tracking-tight">
                  CodeSphere
                </span>
              </div>

              <p className="text-sm text-neutral-500 leading-relaxed max-w-xs -mt-2">
                Built for developers who care about speed. The open-source
                platform for real-time collaboration and zero-config
                environments.
              </p>

              <div className="flex items-center gap-3">
                {socials.map(({ href, icon: Icon }, idx) => (
                  <Link
                    href={href}
                    key={idx}
                    target="_blank"
                    className="group flex items-center justify-center w-10 h-10 rounded-lg border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm hover:bg-neutral-800 hover:border-neutral-600 transition-all duration-200"
                  >
                    <Icon className="w-5 h-5 text-neutral-400 group-hover:text-neutral-50 transition-colors duration-200" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-10 sm:gap-16">
              <div className="flex flex-col gap-4">
                <h4 className="text-neutral-50 text-xs font-bold uppercase tracking-wider">
                  Features
                </h4>
                <div className="flex flex-col gap-2">
                  {[
                    "Real-time collaboration",
                    "Voice calling",
                    "AI code assistance",
                    "Version history",
                    "Diff previews",
                    "Live execution",
                  ].map((item, idx) => (
                    <Link
                      key={idx}
                      href="/features"
                      className="text-sm hover:text-neutral-50 transition-colors duration-200"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-neutral-50 text-xs font-bold uppercase tracking-wider">
                  Supported languages
                </h4>
                <div className="flex flex-col gap-2">
                  {["JavaScript / Node.js", "Python", "C / C++", "Java"].map(
                    (lang, idx) => (
                      <Link
                        key={idx}
                        href="/languages"
                        className="text-sm hover:text-neutral-50 transition-colors duration-200"
                      >
                        {lang}
                      </Link>
                    )
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-neutral-50 text-xs font-bold uppercase tracking-wider">
                  About
                </h4>
                <div className="flex flex-col gap-2">
                  {["Contact", "FAQ", "Roadmap"].map((item, idx) => (
                    <Link
                      key={idx}
                      href={item.toLowerCase()}
                      className="text-sm hover:text-neutral-50 transition-colors duration-200"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-0 pt-8 border-t border-neutral-900">
            <p className="text-xs sm:text-sm text-neutral-600 text-center sm:text-left">
              © {new Date().getFullYear()} CodeSphere. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {["Terms and Conditions", "Privacy Policy"].map((item, idx) => (
                <Link
                  key={idx}
                  href={item.split(" ")[0].toLowerCase()}
                  className="text-xs sm:text-sm text-neutral-500 hover:text-neutral-300 transition-colors duration-200"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

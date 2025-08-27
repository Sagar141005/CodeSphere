import { Facebook, Github, Instagram } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  const socials = [
    {
      href: "https://www.instagram.com/sagar.s0602",
      icon: Instagram,
    },
    {
      href: "https://github.com/Sagar141005",
      icon: Github,
    },
    {
      href: "https://www.facebook.com/profile.php?id=100019223773994",
      icon: Facebook,
    },
  ];
  return (
    <footer className="bg-[#1A1A1A] px-6 sm:px-10 py-10 sm:py-12 text-neutral-300 flex flex-col gap-12">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-16">
        {/* Social Icons */}
        <div className="flex items-center gap-4">
          {socials.map(({ href, icon: Icon }, idx) => (
            <Link
              href={href}
              key={idx}
              className="group size-10 p-2 rounded-full border border-neutral-500 hover:bg-gradient-to-r from-indigo-300 to-cyan-300 transition-all duration-300 cursor-pointer"
            >
              <Icon className="w-full h-full text-white group-hover:scale-110 transition-transform duration-300" />
            </Link>
          ))}
        </div>

        {/* Footer Links */}
        <div className="flex flex-col sm:flex-row gap-8 sm:gap-16">
          {/* Features */}
          <div className="flex flex-col gap-2">
            <h4 className="text-white text-md font-semibold mb-1">Features</h4>
            {[
              "Real-time collaboration",
              "Voice calling inside rooms",
              "AI code assistance",
              "Version history",
              "Diff previews",
              "Live execution",
            ].map((item, idx) => (
              <Link
                key={idx}
                href="/features"
                className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 cursor-Linkointer"
              >
                {item}
              </Link>
            ))}
          </div>

          {/* Languages */}
          <div className="flex flex-col gap-2">
            <h4 className="text-white text-md font-semibold mb-1">
              Supported languages
            </h4>
            {["JavaScript / Node.js", "Python", "C / C++", "Java"].map(
              (lang, idx) => (
                <Link
                  key={idx}
                  href="/languages"
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  {lang}
                </Link>
              )
            )}
          </div>

          {/* About */}
          <div className="flex flex-col gap-2">
            <h4 className="text-white text-md font-semibold mb-1">About</h4>
            {["Contact", "FAQ", "Roadmap"].map((item, idx) => (
              <Link
                key={idx}
                href={item.toLowerCase()}
                className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 cursor-pointer"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0 pt-6 border-t border-neutral-800">
        <p className="text-xs sm:text-sm text-neutral-500 text-center sm:text-left">
          © {new Date().getFullYear()} CodeSphere. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {["Terms and Conditions", "Privacy Policy"].map((item, idx) => (
            <Link
              key={idx}
              href={item.split(" ")[0].toLowerCase()}
              className="text-xs sm:text-sm text-neutral-400 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

"use client";

import { Menu, SquareDashedBottomCode, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserAvatar } from "../UserAvatar";
import { motion, AnimatePresence } from "motion/react";

const navItems = [
  { href: "/rooms", label: "Rooms" },
  { href: "/teams", label: "Teams" },
];

const HomeNavbar = () => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-10">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 shadow-sm transition-colors group-hover:border-neutral-600">
              <SquareDashedBottomCode className="h-5 w-5 text-neutral-50 transform -rotate-16 group-hover:rotate-0 transition-transform duration-500" />
            </div>

            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-neutral-50">
                CodeSphere
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                Collaborative Code Editor
              </span>
            </div>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {navItems.map(({ href, label }) => {
              const isActive =
                href === "/teams"
                  ? pathname?.startsWith("/team")
                  : pathname?.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  className="relative px-3 py-1.5 text-sm font-medium transition-colors hover:text-neutral-50 focus-visible:outline-none"
                >
                  <span
                    className={`relative z-10 transition-colors ${
                      isActive
                        ? "text-neutral-50"
                        : "text-neutral-400 hover:text-neutral-100"
                    }`}
                  >
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="flex items-center justify-center rounded-md p-2 text-neutral-200 hover:bg-neutral-800 hover:text-neutral-50 focus:outline-none md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <motion.div
              initial={false}
              animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </motion.div>
          </button>

          {status === "authenticated" && user ? (
            <Link href="/profile">
              <div className="rounded-full ring-2 ring-transparent transition-all hover:ring-neutral-600">
                <UserAvatar
                  user={{
                    name: user.name ?? "Anonymous",
                    image: user.image ?? undefined,
                  }}
                />
              </div>
            </Link>
          ) : (
            <Link
              href="/signup"
              className="hidden items-center justify-center rounded-lg bg-neutral-50 px-4 py-2 text-sm font-semibold text-neutral-950 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] sm:inline-flex"
            >
              Sign up
            </Link>
          )}
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="border-t border-neutral-800 bg-neutral-950 overflow-hidden md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {navItems.map(({ href, label }, index) => {
                const isActive =
                  href === "/teams"
                    ? pathname?.startsWith("/team")
                    : pathname?.startsWith(href);

                return (
                  <motion.div
                    key={href}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex w-full items-center rounded-md px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-neutral-800 text-neutral-50"
                          : "text-neutral-200 hover:bg-neutral-900 hover:text-neutral-50"
                      }`}
                    >
                      {label}
                    </Link>
                  </motion.div>
                );
              })}

              {status !== "authenticated" && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="mt-2 pt-2 border-t border-neutral-800"
                >
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center rounded-lg bg-neutral-50 py-3 text-sm font-bold text-neutral-950 transition-transform active:scale-[0.98]"
                  >
                    Sign up
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default HomeNavbar;

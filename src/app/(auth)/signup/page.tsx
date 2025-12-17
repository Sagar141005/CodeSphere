"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "motion/react";
import { Mail, Lock, User, Loader2, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      toast("👀 You're already logged in");
      router.push("/rooms");
    }
  }, [status, router]);

  const isPasswordInvalid = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return password.length > 0 && !passwordRegex.test(password);
  };

  const isFormInvalid = !name || !email || !password || isPasswordInvalid();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Account created");
      router.push("/login");
    } else {
      const data = await res.json();
      toast.error(data.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-neutral-900 border border-neutral-800 shadow-xl rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-2 text-white">
              Create an account
            </h1>
            <p className="text-neutral-400 text-sm">
              Enter your details to get started with CodeSphere
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="text-xs font-medium text-neutral-400 ml-1"
              >
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-neutral-500 group-focus-within:text-neutral-200 transition-colors" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all placeholder:text-neutral-600 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-neutral-400 ml-1"
              >
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-neutral-500 group-focus-within:text-neutral-200 transition-colors" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-all placeholder:text-neutral-600 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-neutral-400 ml-1"
              >
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-neutral-500 group-focus-within:text-neutral-200 transition-colors" />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 bg-neutral-950 border rounded-xl focus:outline-none focus:ring-1 transition-all placeholder:text-neutral-600 text-sm ${
                    isPasswordInvalid()
                      ? "border-red-900/50 focus:border-red-500/50 focus:ring-red-900/20 text-red-200"
                      : "border-neutral-800 focus:border-neutral-500 focus:ring-neutral-500"
                  }`}
                  required
                />
              </div>
              {isPasswordInvalid() && (
                <p className="text-neutral-500 text-[10px] ml-1">
                  Min 8 chars, uppercase, lowercase, number & symbol required.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isFormInvalid || loading}
              className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2
                ${
                  isFormInvalid || loading
                    ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-800"
                    : "bg-white text-black hover:bg-neutral-200 border border-white active:scale-[0.98]"
                }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-neutral-900 px-2 text-neutral-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => signIn("google")}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:text-white transition-all duration-200 active:scale-95"
            >
              <img
                src="/Google-icon.svg"
                alt="Google"
                className="w-4 h-4 opacity-80 group-hover:opacity-100"
              />
              <span className="text-sm font-medium text-neutral-400">
                Google
              </span>
            </button>
            <button
              onClick={() => signIn("github")}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl hover:bg-neutral-800 hover:text-white transition-all duration-200 active:scale-95"
            >
              <img
                src="/Github-icon.svg"
                alt="GitHub"
                className="w-4 h-4 invert opacity-80"
              />
              <span className="text-sm font-medium text-neutral-400">
                GitHub
              </span>
            </button>
          </div>

          <p className="text-center text-xs text-neutral-500 mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-neutral-300 hover:text-white hover:underline transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

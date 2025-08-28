"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isPasswordInvalid = () => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return !passwordRegex.test(password);
  };

  const isFormInvalid = !email || !password || isPasswordInvalid();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await signIn("credentials", {
      redirect: true,
      email,
      password,
    });

    if (result?.ok) {
      router.push("/rooms");
    } else {
      setError(result?.error || "Invalid email or password");
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
      hasError
        ? "border-red-500 focus:ring-red-500"
        : "border-gray-500 focus:ring-blue-500"
    }`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-black p-4 bg-animated-gradient">
      <div className="w-full max-w-96 min-h-96 bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-6 select-none">
          Login
        </h1>
        {error && <p className="text-red-500 text-center mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1 select-none"
            >
              Email <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1 select-none"
            >
              Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass(!!password && isPasswordInvalid())}
              required
            />
            {password && isPasswordInvalid() && (
              <p className="text-red-500 text-xs mt-1">
                Must be 8+ characters, with uppercase, lowercase, number, and
                symbol.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isFormInvalid}
            className={`w-full py-3 rounded-xl font-semibold text-lg border transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
            ${
              isFormInvalid
                ? "bg-neutral-800 border-neutral-700 text-neutral-500 cursor-not-allowed"
                : "bg-[#1f1f1f] text-white border-[#333] hover:bg-[#3a3a3a] hover:border-[#666] cursor-pointer"
            }`}
          >
            Login
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-700 mb-4 font-semibold select-none">
            Or sign up with
          </p>
          <div className="flex justify-center gap-6">
            {[
              { src: "/Google-icon.svg", alt: "Google" },
              { src: "/Github-icon.svg", alt: "GitHub" },
            ].map(({ src, alt }) => (
              <button
                onClick={() => signIn(`${alt.toLowerCase()}`)}
                key={alt}
                className="p-3 rounded-full border border-gray-300 bg-white/80 hover:shadow-lg hover:scale-110 active:scale-95
                           transition-transform cursor-pointer"
                aria-label={`Sign up with ${alt}`}
              >
                <img src={src} alt={alt} className="w-6 h-6" />
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-600 text-center mt-6">
          Don't have an account?{" "}
          <Link
            href="/signup"
            className="text-blue-700 hover:underline cursor-pointer"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      router.push("/login");
    } else {
      const data = await res.json();
      setError(data.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-black p-4 bg-animated-gradient">
      <div className="w-full max-w-96 min-h-96 bg-white shadow-md rounded-3xl px-8 py-10">
        <h1 className="text-3xl font-extrabold text-gray-800 text-center mb-6 select-none">Sign Up</h1>
        {error && <p className="text-red-500 text-center mb-2">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-6 mt-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 select-none">
              Full Name <span className="text-red-600">*</span>
            </label>
            <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 select-none">
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 select-none">
              Password <span className="text-red-600">*</span>
            </label>
            <input
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            />
          </div>
          
          <button 
          type="submit" 
          className="w-full py-3 rounded-xl bg-[#1f1f1f] text-white font-semibold text-lg border border-[#333] hover:bg-[#1d1d1d] hover:border-[#555] hover:shadow-[0_0_12px_#000]  active:scale-95 transition-all duration-200 cursor-pointer">
            Create Account
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-700 mb-4 font-semibold select-none">Or sign up with</p>
          <div className="flex justify-center gap-6">
            {[
              { src: '/Google-icon.svg', alt: 'Google' },
              { src: '/Github-icon.svg', alt: 'GitHub' }
            ].map(({ src, alt }) => (
              <button
                onClick={() => signIn(`${alt.toLowerCase()}`)}
                key={alt}
                className="p-3 rounded-full border border-gray-300 bg-white/80 hover:shadow-lg hover:scale-110 active:scale-95
                           transition-transform cursor-pointer"
                aria-label={`Sign up with ${alt}`}>
                <img src={src} alt={alt} className="w-6 h-6" />
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-600 text-center mt-6 select-none">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-700 hover:underline cursor-pointer">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

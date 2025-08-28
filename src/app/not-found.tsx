// app/not-found.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      {/* Big gradient 404 */}
      <h1 className="text-6xl sm:text-8xl font-bold bg-gradient-to-r text-transparent bg-clip-text from-indigo-300 to-cyan-300 text-center">
        404
      </h1>

      {/* Subtitle */}
      <p className="mt-4 text-gray-400 text-lg sm:text-xl text-center">
        Oops! The page you’re looking for doesn’t exist.
      </p>

      {/* CTA */}
      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-neutral-500 hover:bg-gradient-to-r from-indigo-300 to-cyan-300 hover:text-black transition-all duration-300"
        >
          Go Back Home <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

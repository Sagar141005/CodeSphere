import Link from "next/link";
import HomeNavbar from "@/components/HomeNavbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <div className="w-full bg-black text-white">
      <HomeNavbar />

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-20 space-y-20">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r text-transparent bg-clip-text from-indigo-300 to-cyan-300 mb-4">
            Contact
          </h1>
          <p className="text-gray-400 text-lg">
            Have questions, feedback, or ideas? We’d love to hear from you.
          </p>
        </header>

        <section className="max-w-2xl mx-auto">
          <form className="space-y-6">
            <input
              type="text"
              placeholder="Your name"
              className="w-full rounded-lg px-4 py-3 bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-indigo-400"
            />
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-lg px-4 py-3 bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-indigo-400"
            />
            <textarea
              rows={5}
              placeholder="Your message"
              className="w-full rounded-lg px-4 py-3 bg-neutral-900 border border-neutral-700 text-white focus:outline-none focus:border-indigo-400"
            />
            <button className="bg-gradient-to-r from-indigo-300 to-cyan-300 text-black font-semibold px-6 py-3 rounded-lg transition hover:opacity-90">
              Send Message
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}

import Footer from "@/components/Footer";
import HomeNavbar from "@/components/HomeNavbar";

export default function PrivacyPage() {
  return (
    <div className="w-full bg-black text-white">
      <HomeNavbar />

      <main className="max-w-5xl mx-auto px-6 md:px-12 py-20 space-y-16">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r text-transparent bg-clip-text from-indigo-300 to-cyan-300 mb-4">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-base sm:text-lg mx-auto max-w-md">
            Your privacy matters to us. This policy explains how CodeSphere
            collects, uses, and protects your data.
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">1. Information We Collect</h2>
          <p className="text-gray-400 leading-relaxed">
            We may collect account details (like email), project files, and
            usage data to improve the platform.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">2. How We Use Information</h2>
          <p className="text-gray-400 leading-relaxed">
            Your information is used to provide core features (real-time
            collaboration, storage, AI assistance) and improve user experience.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">3. Data Security</h2>
          <p className="text-gray-400 leading-relaxed">
            We implement industry-standard security practices to protect your
            data. However, no method is 100% secure, and we cannot guarantee
            absolute protection.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">4. Third-Party Services</h2>
          <p className="text-gray-400 leading-relaxed">
            Some features (AI, hosting, payments) may rely on trusted
            third-party providers. They may access limited data necessary to
            provide their services.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">5. Your Rights</h2>
          <p className="text-gray-400 leading-relaxed">
            You can request data deletion, export, or correction at any time by
            contacting support.
          </p>
        </section>

        <section className="text-center text-gray-500 text-sm mt-12">
          Last updated: August 2025
        </section>
      </main>
      <Footer />
    </div>
  );
}

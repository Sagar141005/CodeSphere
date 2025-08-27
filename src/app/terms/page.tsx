import Footer from "@/components/Footer";
import HomeNavbar from "@/components/HomeNavbar";

export default function TermsPage() {
  return (
    <div className="w-full bg-black text-white">
      <HomeNavbar />

      <main className="max-w-5xl mx-auto px-6 md:px-12 py-20 space-y-16">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r text-transparent bg-clip-text from-indigo-300 to-cyan-300 mb-4">
            Terms & Conditions
          </h1>
          <p className="text-gray-400 text-lg">
            Please read these terms carefully before using CodeSphere. By
            accessing or using our platform, you agree to these conditions.
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
          <p className="text-gray-400 leading-relaxed">
            By signing up or using CodeSphere, you agree to be bound by these
            Terms & Conditions and our Privacy Policy. If you disagree, please
            stop using our services.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">2. Use of the Platform</h2>
          <p className="text-gray-400 leading-relaxed">
            CodeSphere provides online code collaboration tools. You agree not
            to misuse the platform for illegal, harmful, or unauthorized
            activities, including attempts to hack, overload, or disrupt the
            service.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">3. User Accounts</h2>
          <p className="text-gray-400 leading-relaxed">
            You are responsible for maintaining the confidentiality of your
            account and password, and for all activity under your account.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">4. User Content</h2>
          <p className="text-gray-400 leading-relaxed">
            You retain ownership of your code and files. By uploading content,
            you grant CodeSphere a limited license to store, process, and
            display it for collaboration and platform features.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">5. Intellectual Property</h2>
          <p className="text-gray-400 leading-relaxed">
            The CodeSphere name, logo, and platform features are owned by us.
            You may not copy, resell, or exploit any part of the service without
            permission.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">6. Termination</h2>
          <p className="text-gray-400 leading-relaxed">
            We may suspend or terminate your account if you violate these terms
            or misuse the platform. You may also delete your account at any
            time.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">7. Limitation of Liability</h2>
          <p className="text-gray-400 leading-relaxed">
            CodeSphere is provided "as is." We do not guarantee uninterrupted
            service or error-free operation. We are not liable for any data
            loss, downtime, or damages arising from using the service.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">8. Changes to Terms</h2>
          <p className="text-gray-400 leading-relaxed">
            We may update these Terms from time to time. Continued use of the
            platform after updates means you accept the new terms.
          </p>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">9. Governing Law</h2>
          <p className="text-gray-400 leading-relaxed">
            These Terms are governed by applicable laws of your jurisdiction.
            Any disputes will be resolved under those laws.
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

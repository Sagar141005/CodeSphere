import Footer from "@/components/Footer";
import HomeNavbar from "@/components/HomeNavbar";

const roadmap = [
  {
    quarter: "Q2 2025",
    items: ["Real-time code editor", "Team collaboration", "AI code assistant"],
  },
  {
    quarter: "Q2 2025",
    items: [
      "Version control (Git-style)",
      "Dependency management",
      "File explorer with folders",
    ],
  },
  {
    quarter: "Q2 2025",
    items: ["Voice & video calling", "Presence indicators", "Team spaces"],
  },
  {
    quarter: "Q2 2025",
    items: ["GitHub integration", "Export projects", "Advanced analytics"],
  },
];

export default function RoadmapPage() {
  return (
    <div className="w-full bg-black text-white">
      <HomeNavbar />

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-20 space-y-20">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r text-transparent bg-clip-text from-indigo-300 to-cyan-300 mb-4">
            Roadmap
          </h1>
          <p className="text-gray-400 text-lg">
            See what’s coming next for CodeSphere 🚀
          </p>
        </header>

        <section className="space-y-12 max-w-4xl mx-auto">
          {roadmap.map((phase, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border border-neutral-800 bg-neutral-900 hover:border-indigo-400 transition"
            >
              <h2 className="text-2xl font-semibold mb-4">{phase.quarter}</h2>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                {phase.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}

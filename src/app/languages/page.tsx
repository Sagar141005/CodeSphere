import Footer from "@/components/Footer";
import HomeNavbar from "@/components/HomeNavbar";

const languages = [
  {
    id: "python",
    name: "Python",
    description:
      "A versatile high-level language popular for AI, data science, and web development.",
    extensions: [".py"],
    run: "python3 main.py",
    img: "/python.svg",
  },
  {
    id: "javascript",
    name: "JavaScript",
    description:
      "The language of the web. Supports both client-side and server-side development.",
    extensions: [".js"],
    run: "node main.js",
    img: "/js.svg",
  },
  {
    id: "node",
    name: "Node.js",
    description:
      "JavaScript runtime for building fast and scalable server-side applications.",
    extensions: [".js"],
    run: "node main.js",
    img: "/node.svg",
  },
  {
    id: "c-cpp",
    name: "C / C++",
    description:
      "Powerful low-level languages used for system programming, performance-critical apps, and game development.",
    extensions: [".c", ".cpp"],
    run: "g++ program.cpp -o program.out && ./program.out",
    img: "/c++.svg",
  },
  {
    id: "java",
    name: "Java",
    description:
      "A robust, object-oriented language used for enterprise, Android, and backend systems.",
    extensions: [".java"],
    run: "javac Main.java && java Main",
    img: "java.svg",
  },
  {
    id: "html",
    name: "HTML",
    description:
      "The standard markup language for creating web pages and applications.",
    extensions: [".html"],
    run: "open index.html",
    img: "html.svg",
  },
  {
    id: "css",
    name: "CSS",
    description:
      "Style sheet language used for designing visually engaging web pages.",
    extensions: [".css"],
    run: "open index.html",
    img: "css.svg",
  },
];

export default function LanguagesPage() {
  return (
    <div className="w-full bg-black text-white">
      <HomeNavbar />

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-20 space-y-32">
        <header className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r text-transparent bg-clip-text from-indigo-300 to-cyan-300 mb-4">
            Supported Languages
          </h1>
          <p className="text-gray-400 text-lg">
            CodeSphere lets you code in your favorite languages. Compile, run,
            and collaborate with your team — all in one workspace.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {languages.map((lang) => (
            <div
              key={lang.id}
              className="p-6 border rounded-lg shadow-sm group hover:bg-white hover:text-black transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1 hover:border-indigo-400"
            >
              <div className="flex items-center gap-3 mb-4">
                <img src={lang.img} className="size-6" />
                <h2 className="text-2xl font-semibold">{lang.name}</h2>
              </div>
              <p className="text-neutral-300 group-hover:text-gray-700 mb-3">
                {lang.description}
              </p>
              <p className="text-sm text-gray-500">
                <strong>Extensions:</strong> {lang.extensions.join(", ")}
              </p>
              <p className="text-sm text-gray-500">
                <strong>Run Command:</strong> {lang.run}
              </p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

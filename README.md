🚀 CodeSphere
CodeSphere is a real-time collaborative coding platform built with Next.js, TypeScript, and PostgreSQL. It brings together features of an online IDE, Git version control, and AI-powered coding assistance — all in the browser.
Think of it as a VS Code in your browser, with real-time collaboration, presence indicators, AI coding assistant, and even voice chat.
✨ Features
🔐 Authentication
Google login with NextAuth.js
Secure session handling
👥 Real-time Collaboration
Multi-user code editing powered by Monaco Editor
Presence indicators (see who’s online in a room)
Local undo/redo per file
🗂 File & Room Management
Room-based collaboration spaces
File explorer with folder nesting
Full CRUD operations (add, rename, delete files/folders)
File icons (VS Code–style)
📦 Dependencies & Preview
Add external dependencies (Lodash, DayJs, UUID, etc.) per room
Live preview with injected dependencies
Support for multiple languages and file types
🕓 Version Control (Git-style)
Commit changes with messages
Browse commit history & details
Revert to specific commits
Sidebar UI with dedicated Version Control tab
🤖 AI Integration
AI-powered code assistant using OpenAI API
Context-aware code explanations
Code refactor
Debug errors
Add useful comments
🗣 Communication
Built-in voice chat for real-time collaboration
🎨 Other Enhancements
Syntax highlighting with language switch
Side-by-side Markdown rendering
Multiple beautiful themes
Deployed on Vercel (frontend)
🛠️ Tech Stack
Frontend: Next.js + TypeScript
Database: PostgreSQL with Prisma ORM
Authentication: NextAuth.js with Google Provider
Editor: Monaco Editor
Collaboration: Socket.IO
AI: OpenAI API
UI/UX: TailwindCSS, shadcn/ui, lucide-react
Deployment: Vercel, Docker
Download full project as ZIP or use package.json with dependencies

⸻

📦 Getting Started

1. Clone the repo
```bash
git clone https://github.com/Sagar141005/CodeSphere.git
cd CodeSphere
```

2. Install dependencies
```bash
npm install
```
3. Setup environment variables
Create a .env file in the root directory with:
```bash
DATABASE_URL=your-db-url
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-cloudinary-upload-preset
OPENAI_API_KEY=your-openai-key
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```
4. Run Prisma migrations
```bash
npx prisma migrate dev
```
5. Start the dev server
```bash
npm run dev
```

🌍 Deployment
	•	Frontend: Vercel
	•	Database: Hosted PostgreSQL (Supabase)

 🛠️ Upcoming Features / TODO
  GitHub Integration
	  •	Push commits directly to GitHub.
	  •	Clone public repos into a room.
	Advanced AI Features
	  •	AI pair programming mode.
	  •	AI test case generation.
	Video Chat
	  •	In-room video calls (alongside voice chat).
	More Language Runtimes
	  •	Add runtime support for Python, Java, C/C++.
	Collaboration Enhancements
	  •	Commenting system (inline code comments).
	  •	@mentions and notifications.
	Mobile & Tablet Optimizations
	  •	Touch-based editing.
	  •	Mobile-friendly sidebar & preview.


🤝 Contributing
This project was built solo as a portfolio project, but contributions, feedback, and ideas are welcome.

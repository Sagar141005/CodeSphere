# 🚀 CodeSphere

**CodeSphere** is a real-time collaborative coding platform built with **Next.js**, **TypeScript**, and **PostgreSQL**.  
It unifies the features of an online IDE, Git version control, and an AI-powered coding assistant into a single browser-based workspace.  

Think of it as a **VS Code in your browser** - designed for seamless pair programming, technical interviews, and remote team collaboration.  

## 🔗 Live Demo  

- **Live**: [codesphere.sagarsaini.com](https://codesphere.sagarsaini.com)  

## 🎯 Purpose of the Project  
This project was built to tackle the complexities of **real-time state synchronization** and **cloud-based development environments**. The goals include:  
- Solving Latency Challenges: Managing sub-millisecond updates between multiple users editing the same file.  
- AI Integration: Moving beyond simple auto-complete to context-aware AI pairing using OpenAI.  
- Full-Stack Proficiency: Demonstrating complex state management with Redux/Context on the frontend and scalable WebSocket architecture on the backend.  


## ✨ Key Features

### 👨‍💻 Real-time Collaboration & Editor
- Multi-user Editing: See others' edits in real-time (powered by Socket.IO).  
- VS Code Experience: Built on Monaco Editor for a familiar, high-fidelity coding experience.  
- Presence System: Live indicators showing who is online in the room.  
- Voice Chat: Integrated voice channels for seamless communication while coding.  

### 🧠 AI & Productivity
- AI-powered code assistant using **OpenAI API**  
- Context-aware code explanations  
- Code refactor  
- Debug errors  
- Add useful comments  

### 🗂 File & Room Management
- Room-based collaboration spaces  
- File explorer with folder nesting  
- Full CRUD operations (add, rename, delete files/folders)  
- File icons (VS Code–style)  

### 📦 Dependencies & Preview
- Add external dependencies (Lodash, DayJs, UUID, etc.)  
- Live preview with injected dependencies  
- Support for multiple languages and file types  

### 🗣 Communication
- Built-in **voice chat** for real-time collaboration  

### 🎨 Other Enhancements
- Syntax highlighting with language switch  
- Side-by-side Markdown rendering  
- Multiple beautiful themes  
- Download full project as ZIP or use `package.json` with dependencies  

## 🛠️ Tech Stack

- **Frontend**: Next.js + TypeScript  
- **Database**: PostgreSQL with Prisma ORM  
- **Authentication**: NextAuth.js with Google Provider  
- **Editor**: Monaco Editor  
- **Collaboration**: Socket.IO  
- **AI**: OpenAI API  
- **UI/UX**: TailwindCSS, shadcn/ui, lucide-react  
- **Deployment**: Vercel, Docker

| Layer        | Tools / Stack                                       |
|--------------|------------------------------------------------------|
| Frontend     | Next.js, TypeScript, Tailwind CSS                    |
| Backend      | Node.js, Express                                     |
| Database     | PostgreSQL with Prisma ORM                           |
| Auth         | NextAuth.js with Google and Github Provider          |
| AI Assistant | OpenAI API                                           |
| Editor       | Monaco Editor                                        |
| DevOps       | Docker, GitHub Actions                               |
| Hosting      | Vercel (Frontend), Render (Backend)                  |

## 💡 System Design Decisions
Building a collaborative IDE requires specific architectural choices to ensure performance and reliability.  

- **Why Monaco Editor?**
  - Instead of building a text area from scratch, we used Monaco to provide Intellisense, minimizing the learning curve for developers already used to VS Code.  

- **Why Socket.IO over HTTP?**
  - Collaboration requires bidirectional, low-latency communication. Polling a database via HTTP would introduce lag. WebSockets allow us to push keystroke updates instantly to all connected clients.  

- **Why PostgreSQL + Prisma?**
  - While the code state is transient during editing, user sessions, room metadata, and commit history are relational. Prisma provides type-safe database access, ensuring data integrity across complex relationships.  

## 🔐 Environment Variables

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

## 📦 Getting Started

### 1. Clone the repo
```bash
git clone https://github.com/Sagar141005/CodeSphere.git
cd CodeSphere
```  

2. Install dependencies
```bash
npm install
```  

3. Database Setup
Ensure your PostgreSQL instance is running and the DATABASE_URL is set.  
```bash
npx prisma migrate dev
```  
5. Run the development server
```bash
npm run dev
```

## 🌍 Deployment

- **Frontend**: Vercel  
- **Database**: Hosted PostgreSQL (e.g., Supabase)

## 🧪 Upcoming Features / TODO

### 🔗 GitHub Integration
- Push commits directly to GitHub  
- Clone public repos into a room  

### 🤖 Advanced AI Features
- AI pair programming mode   
- AI test case generation  

### 🎥 Video Chat
- In-room video calls (alongside voice chat)  

### 🧑‍💻 More Language Runtimes
- Add runtime support for **Rust**, **Ruby**, **Go**  

### 💬 Collaboration Enhancements
- Inline code commenting system  
- `@mentions` and notifications  

### 📱 Mobile & Tablet Optimizations
- Touch-based editing  
- Mobile-friendly sidebar & preview  

## Support

If you find CodeSphere helpful or interesting, please consider **starring the repository**! It helps the project reach more developers.

## 📇 Contact

Want to collaborate or give feedback?

- 🐦 Twitter: [@not_sagar1410](https://x.com/not_sagar1410)  
- 💼 LinkedIn: [Sagar Saini](https://www.linkedin.com/in/sagar-saini-9b45a52b2/)

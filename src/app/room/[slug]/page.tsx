import CodeEditor from "@/components/Editor";

export default async function RoomPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params; 
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-xl font-bold mt-4">Room: {slug}</h1>
      <div className="w-full max-w-6xl mt-4">
        <CodeEditor slug={slug} />
      </div>
    </div>
  );
}

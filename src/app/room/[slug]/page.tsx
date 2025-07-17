import CodeEditor from "@/components/Editor";

export default function RoomPage({ params }: { params: { slug: String } }) {
    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-xl font-bold mt-4">Room: {params.slug}</h1>
            <div className="w-full max-w-6xl mt-4">
                <CodeEditor />
            </div>
        </div>
    )
}
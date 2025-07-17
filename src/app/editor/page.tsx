import CodeEditor from "@/components/Editor";

export default function EditorPage() {
    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold my-6">CodeSphere</h1>
            <div className="w-full max-w-6xl">
                <CodeEditor />
            </div>
        </div>
    )
}
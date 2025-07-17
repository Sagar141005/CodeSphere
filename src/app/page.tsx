'use client';

import { signIn, signOut, useSession } from "next-auth/react";

export default function Home() {
  const { data: session, status } = useSession();

  if(status === 'loading') {
    return <p className="text-center mt-10">Loading session...</p>
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      {session ? (
        <>
          <h1 className="text-2xl font-semibold">Welcome, {session.user?.name}!</h1>
          <p className="text-gray-600">{session.user?.email}</p>
          <button
            onClick={() => signOut()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
            Sign Out
          </button>
          <a href="/editor" className="text-blue-400 hover:underline">Go to Editor</a>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold">Sign In</h1>
          <div className="flex gap-4">
            <button
              onClick={() => signIn('google')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Sign in with Google
            </button>
            <button
              onClick={() => signIn('github')}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded">
              Sign in with GitHub
            </button>
          </div>
        </>
      )}
    </div>
  );
}

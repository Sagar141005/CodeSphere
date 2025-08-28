"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import CursorBlob from "@/components/CursorBlob";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CursorBlob />
      <Toaster position="top-right" />
      <SessionProvider>{children}</SessionProvider>
    </>
  );
}

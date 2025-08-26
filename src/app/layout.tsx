"use client";

import CursorBlob from "@/components/CursorBlob";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CursorBlob />
        <Toaster position="top-right" />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

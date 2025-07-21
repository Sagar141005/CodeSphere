'use client';

import CursorBlob from "@/components/CursorBlob";
import "./globals.css";
import { SessionProvider } from "next-auth/react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CursorBlob />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

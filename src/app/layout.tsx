import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://codesphere.sagarsaini.com"),
  title: "CodeSphere – Real-time Code Collaboration & AI Editor",
  description:
    "Experience the future of coding with CodeSphere. A unified workspace featuring real-time collaboration, AI pair programming, voice chat, and version control for seamless teamwork.",
  keywords: [
    "real-time code collaboration",
    "online IDE",
    "collaborative code editor",
    "AI pair programmer",
    "CodeSphere",
    "remote coding interview",
    "web-based code editor",
    "developer productivity tools",
    "shared coding workspace",
    "pair programming software",
  ],
  authors: [{ name: "Sagar Saini", url: "https://sagarsaini.com" }],
  creator: "Sagar Saini",
  publisher: "Sagar Saini",
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "CodeSphere – Real-time Code Collaboration & AI Editor",
    description:
      "Collaborate on code in real-time with AI assistance, integrated voice calling, and version control. The ultimate environment for remote development teams.",
    siteName: "CodeSphere",
    images: [
      {
        url: "/og-banner.png",
        width: 1200,
        height: 600,
        alt: "CodeSphere Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeSphere – Real-time Code Collaboration & AI Editor",
    description:
      "Collaborate on code in real-time with AI assistance, integrated voice calling, and version control. The ultimate environment for remote development teams.",
    images: [
      {
        url: "/og-banner.png",
        width: 1200,
        height: 600,
        alt: "CodeSphere Dashboard Preview",
      },
    ],
    creator: "@not_sagar1410",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";
import ClientProviders from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://codesphere.sagarsaini.com"),
  title: "CodeSphere – Real-time Code Collaboration",
  description:
    "CodeSphere is a collaborative code editor with AI assistance, voice calling, version control, and team features — all in one workspace.",
  keywords: [
    "Code Collaboration",
    "Online IDE",
    "Real-time Editor",
    "CodeSphere",
    "AI Pair Programmer",
  ],
  authors: [{ name: "Sagar Saini", url: "https://sagarsaini.com" }],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/apple-touch-icon.png", rel: "apple-touch-icon" },
    ],
  },
  openGraph: {
    title: "CodeSphere – Real-time Code Collaboration",
    description:
      "Collaborate on code in real-time with AI assistance, voice calling, version control, and more.",
    url: "https://codesphere.sagarsaini.com",
    siteName: "CodeSphere",
    images: [
      {
        url: "/banner.webp",
        width: 1200,
        height: 630,
        alt: "CodeSphere Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeSphere – Real-time Code Collaboration",
    description:
      "Collaborate on code in real-time with AI assistance, voice calling, version control, and more.",
    images: ["/banner.webp"],
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
      <head>
        {/* Manual fallback links for better Safari support */}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}

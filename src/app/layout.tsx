import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tapas",
  description: "Tapas official homepage",
  // Google Search Console — HTML tag verification.
  // Paste the content value from the "HTML tag" method
  // (the part inside content="..."), then redeploy and click Verify.
  verification: {
    google: "ovwI8aIu1eUh4YUhfai7ohxDLv4bnBBUlF9AwStjqVE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

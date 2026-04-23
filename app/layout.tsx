import type { Metadata } from "next";
import "../public/styles/globals.css";

export const metadata: Metadata = {
  title: "SafeTrust",
  description: "SafeTrust is a decentralized and secure platform P2P",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}

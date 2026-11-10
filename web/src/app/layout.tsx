import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hitbullseye CT & AI",
  description: "Computational Thinking & AI practice, assessment and analytics for CBSE Classes 3–8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

/* eslint-disable camelcase */
const jakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });
/* eslint-enable camelcase */

export const metadata: Metadata = {
  title: "Mechanico — Super Admin",
  description: "Internal admin panel for managing Mechanico merchants",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={jakartaSans.className}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

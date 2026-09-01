import type { Metadata } from "next";
import "./globals.css";
import { SiteNav } from "../components/site-nav";

export const metadata: Metadata = {
  title: "Activio — Find your people, find your play",
  description: "A warmer way to find people nearby who are into the same things."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><SiteNav />{children}</body>
    </html>
  );
}

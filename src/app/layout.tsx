import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // taste-skill-ignore: Geist Mono is used only for literal code
import "./globals.css";
import SmoothScrollProvider from "@/components/smooth-scroll-provider";
import Navbar from "@/components/navbar";
import SessionGuard from "@/components/session-guard";
import AppFooter from "@/components/app-footer";
import { getCurrentUser } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({ // taste-skill-ignore: code only
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Snippi: a private library for the code you reuse",
  description:
    "Save the SQL, configs and helpers you keep rewriting. Find them in a keystroke, copy, and get back to work.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased flex flex-col` /* taste-skill-ignore: mono var feeds code blocks only */}>
        <SmoothScrollProvider>
          <Navbar user={user} />
          {user && <SessionGuard />}
          <main className="flex-1 pt-16">{children}</main>
          {user && <AppFooter />}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

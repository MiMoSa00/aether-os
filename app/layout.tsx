import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/Layout/MainLayout";
import { DataProvider } from "@/context/DataContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aether OS | Next-Gen Workspace",
  description: "AI-Powered Agency Workspace and Project Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="dark">
        <DataProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </DataProvider>
      </body>
    </html>
  );
}

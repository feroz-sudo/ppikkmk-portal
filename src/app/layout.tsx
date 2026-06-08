import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { PrintHelper } from "@/components/PrintHelper";
import "./globals.css";

export const metadata: Metadata = {
  title: "PPIKKMK Portal - UPSI",
  description: "Portal Praktikum dan Internship Kaunseling Kesihatan Mental Klinikal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <PrintHelper />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

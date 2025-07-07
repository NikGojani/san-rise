import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./Header";
import Sidebar from "./Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SAN RISE Dashboard",
  description: "Konzert-Dashboard für SAN RISE - Ticketverkauf, Kostenrechnung und Projektmanagement",
  keywords: "konzert, dashboard, ticketverkauf, projektmanagement, zeiterfassung",
  authors: [{ name: "SAN RISE Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#ffffff",
  robots: "index, follow",
  openGraph: {
    title: "SAN RISE Dashboard",
    description: "Konzert-Dashboard für SAN RISE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SAN RISE" />
      </head>
      <body className={inter.className}>
        <div style={{ display: 'flex', minHeight: '100vh', background: '#fafafc' }}>
          <Sidebar />
          <div style={{ flex: 1, maxWidth: '100vw', overflowX: 'auto' }}>
            <Header />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

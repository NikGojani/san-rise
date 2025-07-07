import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
        <header
          style={{
            width: '100%',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderRadius: '0 0 18px 18px',
            padding: '0.5rem 0',
            marginBottom: '2rem',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            minHeight: '56px',
          }}
        >
          <button
            style={{
              marginLeft: '1.5rem',
              background: '#f5f5f7',
              color: '#111',
              border: 'none',
              borderRadius: '12px',
              padding: '0.5rem 1.2rem',
              fontSize: '1rem',
              fontWeight: 500,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onClick={() => alert('Logout-Logik hier einfügen')}
            onMouseOver={e => (e.currentTarget.style.background = '#e5e5ea')}
            onMouseOut={e => (e.currentTarget.style.background = '#f5f5f7')}
          >
            Ausloggen
          </button>
        </header>
        {children}
      </body>
    </html>
  );
}

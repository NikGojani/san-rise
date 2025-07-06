import Link from "next/link";
import Image from "next/image";

const pages = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/kosten", label: "Kosten-Tool" },
  { href: "/vergleich", label: "Vergleichsrechner" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-10 font-[system-ui,sans-serif]">
      <div className="flex flex-col items-center gap-6 w-full max-w-xs">
        <Image
          src="/WhatsApp%20Image%202025-07-05%20at%2004.18.38.jpeg"
          alt="SAN RISE Logo"
          width={120}
          height={120}
          className="rounded-2xl shadow-lg mb-2"
          style={{ filter: 'invert(1)' }}
        />
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight text-center mb-2">Harmonic Dashboard</h1>
        <div className="flex flex-col gap-4 w-full mt-4">
          {pages.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 text-lg font-semibold text-center shadow transition-all border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {page.label}
            </Link>
          ))}
        </div>
        <div className="mt-8 text-xs text-gray-400 text-center w-full">
          Weitere Seiten erscheinen automatisch.<br />
          <span className="text-gray-300">&copy; {new Date().getFullYear()} Harmonic</span>
        </div>
      </div>
    </div>
  );
}

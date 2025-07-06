"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";

const pages = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/kosten", label: "Kostenrechner" },
  { href: "/vergleich", label: "Vergleichsrechner" },
  { href: "/projekte", label: "Projektmanagement" },
  { href: "/konzertplanung", label: "Konzertplanung" },
];

const accounts = ["Stury", "Nik", "Adrian", "Peen"];
const PASSWORD = "wirwollengeld";

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [account, setAccount] = useState(accounts[0]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("harmonic_logged_in") === "true") {
      setLoggedIn(true);
    }
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === PASSWORD) {
      setLoggedIn(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("harmonic_logged_in", "true");
        localStorage.setItem("harmonic_user", account);
      }
    } else {
      setError("Falsches Passwort");
    }
  }

  if (!loggedIn) {
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
          <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full bg-gray-50 rounded-2xl shadow p-6">
            <h2 className="text-2xl font-bold text-center mb-2">Login</h2>
            <select
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg focus:ring-2 focus:ring-blue-400"
              value={account}
              onChange={e => setAccount(e.target.value)}
            >
              {accounts.map(acc => <option key={acc}>{acc}</option>)}
            </select>
            <input
              type="password"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-lg focus:ring-2 focus:ring-blue-400"
              placeholder="Passwort"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gray-900 text-white text-lg font-semibold text-center shadow hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

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
      </div>
    </div>
  );
}

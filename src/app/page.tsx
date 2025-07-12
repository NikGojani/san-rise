"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const allowedUsers = ["Nik", "Peen", "Stury", "Adrian"];
const PASSWORD = "wirwollengeld";

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("harmonic_logged_in") === "true") {
      setLoggedIn(true);
    }
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!allowedUsers.includes(account.trim())) {
      setError("Unbekannter Benutzername");
      return;
    }
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-10 font-[system-ui,sans-serif]"
        style={{ minHeight: '100vh', justifyContent: 'flex-start', paddingTop: '12vh' }}>
        <div className="flex flex-col items-center gap-6 w-full max-w-xs">
          <Image
            src="/WhatsApp%20Image%202025-07-05%20at%2004.18.38.jpeg"
            alt="SAN RISE Logo"
            width={144}
            height={144}
            className="rounded-2xl shadow-lg mb-2"
            style={{ filter: 'invert(1)' }}
          />
          <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full bg-gray-50 rounded-2xl shadow p-6">
            <h2 className="text-2xl font-bold text-center mb-2">Login</h2>
            <input
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-400"
              placeholder="Name"
              value={account}
              onChange={e => setAccount(e.target.value)}
              autoComplete="username"
            />
            <input
              type="text"
              inputMode="text"
              className={`w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-400 ${password.length > 0 ? 'tracking-widest text-2xl font-bold' : ''}`}
              placeholder="Passwort"
              value={password.length > 0 ? "*".repeat(password.length) : ""}
              onChange={e => {
                const input = e.target.value;
                if (input.length < password.length) {
                  setPassword(password.slice(0, input.length));
                } else {
                  const native = e.nativeEvent as InputEvent;
                  setPassword(password + (native.data || ""));
                }
              }}
              autoComplete="current-password"
              style={password.length > 0 ? { letterSpacing: '0.2em' } : {}}
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
    <div className="h-screen flex flex-col items-center justify-center bg-white px-4 font-[system-ui,sans-serif] overflow-hidden">
      <div className="flex flex-col items-center gap-4 w-full max-w-3xl" style={{ justifyContent: 'flex-start' }}>
        <Image
          src="/WhatsApp%20Image%202025-07-05%20at%2004.18.38.jpeg"
          alt="SAN RISE Logo"
          width={144}
          height={144}
          className="rounded-2xl shadow-lg mb-2"
          style={{ filter: 'invert(1)' }}
        />
        <div className="grid grid-cols-3 gap-8 w-full mt-2" style={{ alignItems: 'center' }}>
          <Link
            href="/projektmanagement"
            className="flex items-center justify-center aspect-[2/1.2] w-full rounded-2xl shadow border border-gray-200 bg-gray-100 hover:bg-gray-200 transition-all text-xl font-semibold text-gray-900 px-4 py-8"
            style={{ minHeight: 80, maxHeight: 120 }}
          >
            <span className="text-center w-full">Projektmanagement</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center justify-center aspect-[2/1.2] w-full rounded-2xl shadow border border-gray-200 bg-gray-100 hover:bg-gray-200 transition-all text-xl font-semibold text-gray-900 px-4 py-8"
            style={{ minHeight: 80, maxHeight: 120 }}
          >
            <span className="text-center w-full">Dashboard</span>
          </Link>
          <Link
            href="/kosten"
            className="flex items-center justify-center aspect-[2/1.2] w-full rounded-2xl shadow border border-gray-200 bg-gray-100 hover:bg-gray-200 transition-all text-xl font-semibold text-gray-900 px-4 py-8"
            style={{ minHeight: 80, maxHeight: 120 }}
          >
            <span className="text-center w-full">Kosten</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

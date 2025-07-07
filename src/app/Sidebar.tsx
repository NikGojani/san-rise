"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Projektmanagement", path: "/aufgaben", icon: "P" },
  { name: "Aufgaben", path: "/projekte", icon: "A" },
  { name: "Kalender", path: "/kalender", icon: "K" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <nav
      style={{
        minWidth: 180,
        background: '#fff',
        borderRadius: '18px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        padding: '2rem 1rem',
        margin: '2rem 0 2rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
        alignItems: 'flex-start',
        position: 'sticky',
        top: 32,
        height: 'fit-content',
      }}
    >
      <img src="/WhatsApp%20Image%202025-07-05%20at%2004.18.38.jpeg" alt="SAN RISE Logo" style={{ width: 48, height: 48, borderRadius: 12, marginBottom: 24, filter: 'invert(1)' }} />
      {navItems.map(item => {
        const active = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              textDecoration: 'none',
              color: active ? '#2563eb' : '#a3a3a3',
              fontWeight: active ? 700 : 500,
              fontSize: 16,
              marginBottom: 8,
              pointerEvents: active ? 'none' : 'auto',
            }}
          >
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 16,
              background: active ? '#f0f6ff' : '#f5f5f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 20,
              color: active ? '#2563eb' : '#a3a3a3',
              marginBottom: 4,
              boxShadow: active ? '0 2px 8px rgba(37,99,235,0.08)' : 'none',
              transition: 'background 0.2s',
            }}>{item.icon}</div>
            <span style={{ fontWeight: active ? 700 : 500 }}>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
} 
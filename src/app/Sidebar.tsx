"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { name: "Aufgaben", path: "/aufgaben" },
  { name: "Projekte", path: "/projekte" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
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
        gap: '1.5rem',
        alignItems: 'flex-start',
        position: 'sticky',
        top: 32,
        height: 'fit-content',
      }}
    >
      {navItems.map(item => (
        <button
          key={item.path}
          onClick={() => router.push(item.path)}
          style={{
            background: pathname === item.path ? '#f5f5f7' : 'transparent',
            color: '#111',
            border: 'none',
            borderRadius: '12px',
            padding: '0.7rem 1.2rem',
            fontSize: '1.1rem',
            fontWeight: pathname === item.path ? 700 : 500,
            cursor: 'pointer',
            width: '100%',
            textAlign: 'left',
            boxShadow: pathname === item.path ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
            transition: 'background 0.2s',
          }}
        >
          {item.name}
        </button>
      ))}
    </nav>
  );
} 
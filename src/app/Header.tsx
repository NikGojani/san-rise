"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isLinktree = pathname === "/";
  return (
    <header
      style={{
        width: '100vw',
        left: 0,
        top: 0,
        position: 'fixed',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        borderRadius: '0 0 18px 18px',
        padding: '1.5rem 0',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        minHeight: '90px',
      }}
    >
      {isLinktree ? (
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
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.removeItem('harmonic_logged_in');
              localStorage.removeItem('harmonic_user');
            }
            router.push('/');
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#e5e5ea')}
          onMouseOut={e => (e.currentTarget.style.background = '#f5f5f7')}
        >
          Ausloggen
        </button>
      ) : (
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
          onClick={() => router.push('/')}
          onMouseOver={e => (e.currentTarget.style.background = '#e5e5ea')}
          onMouseOut={e => (e.currentTarget.style.background = '#f5f5f7')}
        >
          Zurück
        </button>
      )}
    </header>
  );
} 
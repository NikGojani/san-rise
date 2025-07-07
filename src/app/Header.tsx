"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  return (
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
        onClick={() => router.push('/login')}
        onMouseOver={e => (e.currentTarget.style.background = '#e5e5ea')}
        onMouseOut={e => (e.currentTarget.style.background = '#f5f5f7')}
      >
        Ausloggen
      </button>
    </header>
  );
} 
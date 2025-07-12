"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Concert = {
  id: string;
  name: string;
  maxTickets: number;
  verkauft: number;
  budget: number;
};

export type ConcertsContextType = {
  concerts: Concert[];
  updateConcertName: (id: string, name: string) => void;
};

const defaultConcerts: Concert[] = [
  {
    id: 'concert1',
    name: 'Harmonic Anime Night Vol. 1',
    maxTickets: 300,
    verkauft: 330,
    budget: 450,
  },
  {
    id: 'concert2',
    name: 'Harmonic Anime Night Vol. 2',
    maxTickets: 250,
    verkauft: 120,
    budget: 320,
  },
];

const ConcertsContext = createContext<ConcertsContextType | undefined>(undefined);

export function useConcerts() {
  const ctx = useContext(ConcertsContext);
  if (!ctx) throw new Error('useConcerts must be used within ConcertsProvider');
  return ctx;
}

export function ConcertsProvider({ children }: { children: ReactNode }) {
  const [concerts, setConcerts] = useState<Concert[]>(defaultConcerts);

  function updateConcertName(id: string, name: string) {
    setConcerts(concerts => concerts.map(c => c.id === id ? { ...c, name } : c));
  }

  return (
    <ConcertsContext.Provider value={{ concerts, updateConcertName }}>
      {children}
    </ConcertsContext.Provider>
  );
} 
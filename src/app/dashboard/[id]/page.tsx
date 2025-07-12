"use client";

import React from 'react';
import DashboardDetail from '../DashboardDetail';
import { useSearchParams, useRouter } from 'next/navigation';
import { useConcerts } from '../ConcertsContext';

type Props = {
  params: { id: string }
};

export default function ConcertDetailPage({ params }: Props) {
  // const paramsObj = React.use(params) as { id: string } | undefined;
  const id = params.id;
  const searchParams = useSearchParams();
  const router = useRouter();
  const modus = searchParams?.get('modus') === 'heute' ? 'heute' : 'gesamt';
  const { concerts, updateConcertName } = useConcerts();
  const concert = concerts.find((c) => c.id === id);

  if (!concert) {
    return (
      <div className="min-h-screen bg-white text-gray-800 p-6">
        <h1 className="text-2xl font-bold mb-4">Konzert nicht gefunden</h1>
        <p>Es wurde kein Konzert mit der ID "{id}" gefunden.</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="flex flex-col items-center mb-4 mt-2">
        <img src="/WhatsApp%20Image%202025-07-05%20at%2004.18.38.jpeg" alt="SAN RISE Logo" className="mx-auto mb-2 max-w-xs max-h-40 w-auto h-auto rounded-lg" style={{ filter: 'invert(1)' }} />
      </div>
      <div className="flex gap-3 mb-4 mt-2 pl-4 md:pl-6">
        <button
          className="px-4 py-2 rounded font-bold bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300"
          onClick={() => router.push('/dashboard')}
        >
          Zurück
        </button>
        <button
          className={`px-4 py-2 rounded font-bold ${modus === 'gesamt' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'} border border-gray-300`}
          onClick={() => router.replace(`/dashboard/${id}?modus=gesamt`)}
        >Übersicht</button>
        <button
          className={`px-4 py-2 rounded font-bold ${modus === 'heute' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'} border border-gray-300`}
          onClick={() => router.replace(`/dashboard/${id}?modus=heute`)}
        >Heute</button>
      </div>
      <DashboardDetail concert={concert} modus={modus} updateConcertName={updateConcertName} />
    </div>
  );
} 
"use client";
import React, { useState } from "react";

export default function Vergleich() {
  const [betragAlt, setBetragAlt] = useState(1000000);
  const [anteilAlt, setAnteilAlt] = useState(3);
  const [anteilNeu, setAnteilNeu] = useState(31.5);

  // Berechnung: Wie viel müsste die neue Firma machen, damit man auf denselben Betrag kommt?
  const needed = anteilNeu > 0 ? (betragAlt / (anteilNeu / anteilAlt)) : 0;
  const neededUmsatz = anteilNeu > 0 ? (betragAlt / (anteilNeu / 100)) : 0;
  const vergleichBetragNeu = neededUmsatz * (anteilNeu / 100);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 font-[system-ui,sans-serif]">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 flex flex-col gap-8 mt-8 mb-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center tracking-tight">Vergleichsrechner</h1>
        <p className="text-center text-gray-500 mb-4 text-lg">Finde heraus, wie viel Umsatz oder Gewinn du in einer neuen Firma brauchst, um mit einem höheren Anteil auf denselben Auszahlungsbetrag zu kommen.</p>
        <div className="flex flex-col gap-8 mt-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-gray-700 font-semibold text-lg mb-1">Gewinn</label>
              <input type="number" min={0} className="w-full bg-gray-100 rounded-2xl px-6 py-4 text-2xl text-gray-900 text-right font-extrabold border-none focus:ring-2 focus:ring-blue-200 transition placeholder-gray-400" value={betragAlt} onChange={e => setBetragAlt(Number(e.target.value))} placeholder="z.B. 1.000.000" />
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <label className="text-gray-700 font-semibold w-40">Dein Anteil aktuell</label>
              <input type="number" min={0} max={100} className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-xl text-gray-900 text-right font-bold border-none focus:ring-2 focus:ring-blue-200 transition" value={anteilAlt} onChange={e => setAnteilAlt(Number(e.target.value))} />
              <span className="text-gray-500 text-lg font-bold ml-2">%</span>
            </div>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <label className="text-gray-700 font-semibold w-40">Dein Anteil neu</label>
              <input type="number" min={0} max={100} className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-xl text-gray-900 text-right font-bold border-none focus:ring-2 focus:ring-blue-200 transition" value={anteilNeu} onChange={e => setAnteilNeu(Number(e.target.value))} />
              <span className="text-gray-500 text-lg font-bold ml-2">%</span>
            </div>
          </div>
          <div className="flex flex-col gap-6 mt-8">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
              <div className="flex-1 flex flex-col items-center bg-gray-50 rounded-2xl p-6 shadow">
                <span className="text-gray-500 text-base mb-1">Aktuelle Firma</span>
                <span className="text-3xl font-bold text-gray-900">{(betragAlt * (anteilAlt / 100)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                <span className="text-gray-400 text-sm">bei {anteilAlt}% Anteil</span>
              </div>
              <div className="flex-1 flex flex-col items-center bg-gray-50 rounded-2xl p-6 shadow">
                <span className="text-gray-500 text-base mb-1">Neue Firma</span>
                <span className="text-3xl font-bold text-blue-600">{(betragAlt * (anteilNeu / 100)).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                <span className="text-gray-400 text-sm">bei {anteilNeu}% Anteil</span>
              </div>
            </div>
            {/* Prozent mehr Geld Anzeige */}
            <div className="flex flex-col items-center mt-6">
              {betragAlt > 0 && anteilAlt > 0 && anteilNeu > 0 && (
                (() => {
                  const aktuell = betragAlt * (anteilAlt / 100);
                  const neu = betragAlt * (anteilNeu / 100);
                  const prozent = ((neu / aktuell) - 1) * 100;
                  return (
                    <span className={`text-lg font-bold ${prozent > 0 ? 'text-green-600' : prozent < 0 ? 'text-red-500' : 'text-gray-500'}`}>{prozent > 0 ? '+' : ''}{prozent.toLocaleString('de-DE', { maximumFractionDigits: 1 })}% mehr als aktuell</span>
                  );
                })()
              )}
            </div>
            {/* Benötigter Gewinn der neuen Firma */}
            <div className="w-full mt-6 flex flex-col items-center">
              {betragAlt > 0 && anteilAlt > 0 && anteilNeu > 0 && (
                (() => {
                  const aktuell = betragAlt * (anteilAlt / 100);
                  const neededGewinn = aktuell / (anteilNeu / 100);
                  return (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-6 py-5 flex flex-col items-center max-w-xs w-full">
                      <span className="text-gray-500 text-base mb-1 text-center">Benötigter Gewinn der neuen Firma</span>
                      <span className="text-2xl md:text-3xl font-bold text-green-600 mb-1">{neededGewinn.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
                      <span className="text-gray-400 text-xs text-center">Damit du mit {anteilNeu}% wieder auf {aktuell.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} kommst</span>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
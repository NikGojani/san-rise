"use client";
import React, { useState, useEffect } from "react";
import { supabase } from '../supabaseClient';

interface Vertrag {
  id: string;
  name: string;
  betrag: number;
  intervall: string;
  kategorie: string;
}

export default function VertragskostenSeite() {
  const [vertraege, setVertraege] = useState<Vertrag[]>([]);
  const [name, setName] = useState("");
  const [betrag, setBetrag] = useState("");
  const [intervall, setIntervall] = useState("monatlich");
  const [kategorie, setKategorie] = useState("Sonstiges");
  const [errorMsg, setErrorMsg] = useState<string|null>(null);
  const [successMsg, setSuccessMsg] = useState<string|null>(null);
  const [editId, setEditId] = useState<string|null>(null);

  async function fetchVertraege() {
    const { data, error } = await supabase.from('vertragskosten').select('*').order('name');
    if (!error && data) setVertraege(data);
  }

  useEffect(() => { fetchVertraege(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null); setSuccessMsg(null);
    if (!name || !betrag) { setErrorMsg("Bitte alle Felder ausfüllen."); return; }
    if (editId) {
      const { error } = await supabase.from('vertragskosten').update({ name, betrag: parseFloat(betrag), intervall, kategorie }).eq('id', editId);
      if (error) { setErrorMsg(error.message); return; }
      setSuccessMsg("Vertrag aktualisiert!");
    } else {
      const { error } = await supabase.from('vertragskosten').insert([{ name, betrag: parseFloat(betrag), intervall, kategorie }]);
      if (error) { setErrorMsg(error.message); return; }
      setSuccessMsg("Vertrag hinzugefügt!");
    }
    setName(""); setBetrag(""); setIntervall("monatlich"); setKategorie("Sonstiges"); setEditId(null);
    fetchVertraege();
  }

  async function handleDelete(id: string) {
    await supabase.from('vertragskosten').delete().eq('id', id);
    fetchVertraege();
  }

  function startEdit(v: Vertrag) {
    setEditId(v.id);
    setName(v.name);
    setBetrag(v.betrag.toString());
    setIntervall(v.intervall);
    setKategorie(v.kategorie);
  }

  // Monatliche Gesamtsumme berechnen
  const monatSumme = vertraege.reduce((sum, v) => sum + (v.intervall === 'monatlich' ? v.betrag : v.betrag / 12), 0);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start py-8 px-2 font-[system-ui,sans-serif]">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center relative">
        <h1 className="text-xl font-bold mb-4 text-gray-900 tracking-tight">Vertragskosten</h1>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 mb-6 w-full items-end justify-center">
          <input className="border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-200 transition w-56 text-base" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
          <input className="border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-200 transition w-32 text-base" placeholder="Betrag" type="number" value={betrag} onChange={e => setBetrag(e.target.value)} />
          <select className="border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-200 transition text-base" value={intervall} onChange={e => setIntervall(e.target.value)}>
            <option value="monatlich">monatlich</option>
            <option value="jährlich">jährlich</option>
          </select>
          <select className="border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50 focus:ring-2 focus:ring-blue-200 transition text-base" value={kategorie} onChange={e => setKategorie(e.target.value)}>
            <option value="Digitale Dienste">Digitale Dienste</option>
            <option value="Künstler">Künstler</option>
            <option value="Versicherungen">Versicherungen</option>
            <option value="Marketing">Marketing</option>
            <option value="Location">Location</option>
            <option value="Logistik">Logistik</option>
            <option value="Reisekosten">Reisekosten</option>
            <option value="Sonstiges">Sonstiges</option>
          </select>
          <button className="bg-blue-500 text-white rounded-lg px-6 py-3 font-semibold shadow hover:bg-blue-600 transition text-base" type="submit">{editId ? "Speichern" : "Hinzufügen"}</button>
          {editId && <button type="button" className="bg-gray-200 text-gray-700 rounded-lg px-4 py-3 font-semibold ml-2" onClick={() => { setEditId(null); setName(""); setBetrag(""); setIntervall("monatlich"); setKategorie("Sonstiges"); }}>Abbrechen</button>}
        </form>
        {errorMsg && <div className="text-red-600 font-semibold mt-2 mb-2">{errorMsg}</div>}
        {successMsg && <div className="text-green-600 font-semibold mt-2 mb-2">{successMsg}</div>}
        <div className="w-full bg-gray-50 rounded-xl shadow p-6 mt-2">
          <table className="w-full text-left text-base">
            <thead>
              <tr className="text-gray-900">
                <th className="pb-2 font-semibold">Name</th>
                <th className="pb-2 font-semibold">Kategorie</th>
                <th className="pb-2 font-semibold">Betrag</th>
                <th className="pb-2 font-semibold">Intervall</th>
                <th className="pb-2 font-semibold text-right">Monatlich</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {vertraege.map((v) => (
                <tr key={v.id} className="border-b last:border-b-0 text-gray-900 hover:bg-white/80 transition">
                  <td className="py-2 font-medium">{v.name}</td>
                  <td className="py-2">{v.kategorie}</td>
                  <td className="py-2">{v.betrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                  <td className="py-2">{v.intervall}</td>
                  <td className="py-2 text-right text-gray-700">{v.intervall === "jährlich" ? (v.betrag / 12).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : v.betrag.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                  <td className="py-2 flex gap-2 justify-end">
                    <button className="text-gray-400 hover:text-blue-500 transition" title="Bearbeiten" onClick={() => startEdit(v)}>
                      <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M16.862 5.487a2.06 2.06 0 1 1 2.915 2.914l-9.193 9.193a2 2 0 0 1-.707.464l-3.11 1.037a.5.5 0 0 1-.633-.633l1.037-3.11a2 2 0 0 1 .464-.707l9.193-9.193Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button className="text-red-400 hover:text-red-600 text-lg" title="Löschen" onClick={() => handleDelete(v.id)}>✕</button>
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-50">
                <td className="py-2 font-bold text-blue-900" colSpan={4}>Gesamtsumme</td>
                <td className="py-2 text-right font-bold text-blue-900">{monatSumme.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 
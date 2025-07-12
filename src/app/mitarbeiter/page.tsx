"use client";
import React, { useState, useEffect, useRef } from "react";
import { supabase } from '../supabaseClient';

interface Mitarbeiter {
  id: string;
  name: string;
  geburtsdatum: string;
  adresse: string;
  einstellungsdatum: string;
  position: string;
  brutto: string;
  netto: string;
}

export default function MitarbeiterSeite() {
  const [mitarbeiter, setMitarbeiter] = useState<Mitarbeiter[]>([]);
  const [edit, setEdit] = useState<Mitarbeiter|null>(null);
  const [anhang, setAnhang] = useState<{[id: string]: { name: string, data: string }}>({});
  const fileInput = useRef<HTMLInputElement|null>(null);
  const [errorMsg, setErrorMsg] = useState<string|null>(null);
  const [successMsg, setSuccessMsg] = useState<string|null>(null);

  // Laden aus Supabase
  async function fetchMitarbeiter() {
    const { data, error } = await supabase.from('Mitarbeiter').select('*').order('name');
    if (!error && data) setMitarbeiter(data);
  }

  useEffect(() => {
    fetchMitarbeiter();
    // Realtime-Updates
    const channel = supabase
      .channel('public:mitarbeiter')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Mitarbeiter' }, fetchMitarbeiter)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Speichern (neu oder update)
  async function handleSave() {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!edit || !edit.name) return;
    let error = null;
    if (edit.id) {
      const { error: err, data, status, statusText } = await supabase.from('Mitarbeiter').update({
        einstellungsdatum: edit.einstellungsdatum,
        name: edit.name,
        geburtsdatum: edit.geburtsdatum,
        adresse: edit.adresse,
        position: edit.position,
        brutto: parseFloat(edit.brutto),
        netto: edit.netto ? parseFloat(edit.netto) : null
      }).eq('id', edit.id);
      console.log('Supabase Update Response:', { err, data, status, statusText });
      error = err;
    } else {
      const { error: err, data, status, statusText } = await supabase.from('Mitarbeiter').insert([{
        einstellungsdatum: edit.einstellungsdatum,
        name: edit.name,
        geburtsdatum: edit.geburtsdatum,
        adresse: edit.adresse,
        position: edit.position,
        brutto: parseFloat(edit.brutto),
        netto: edit.netto ? parseFloat(edit.netto) : null
      }]);
      console.log('Supabase Insert Response:', { err, data, status, statusText });
      error = err;
      if (!err && data) setSuccessMsg('Mitarbeiter erfolgreich angelegt!');
    }
    if (error) {
      setErrorMsg(error.message);
      return;
    }
    setEdit(null);
    fetchMitarbeiter();
  }

  // Löschen
  async function handleDelete(id: string) {
    await supabase.from('Mitarbeiter').delete().eq('id', id);
    fetchMitarbeiter();
  }
  
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, id: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setAnhang(a => ({ ...a, [id]: { name: file.name, data: ev.target?.result as string } }));
    };
    reader.readAsDataURL(file);
  }

  // Berechne Gesamtkosten aller Mitarbeiter
  const corporateCost = mitarbeiter.reduce((total, m) => {
    const brutto = parseFloat(m.brutto) || 0;
    const lohnnebenkosten = brutto * 0.22;
    return total + brutto + lohnnebenkosten;
  }, 0);

  // Avatar-Helper für Initialen
  function getInitialen(name: string) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-start py-12 px-2 font-[system-ui,sans-serif]">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 tracking-tight">Mitarbeiter</h1>
      
      {/* CORPORATE COST Übersicht */}
      <div className="w-full max-w-3xl mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border border-blue-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">CORPORATE COST</h2>
            <div className="text-4xl font-bold text-blue-600">
              {corporateCost.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              Monatliche Gesamtkosten für {mitarbeiter.length} Mitarbeiter
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl flex flex-col gap-8">
        {/* Bearbeitungsformular */}
        {edit ? (
          <div className="bg-gray-50 rounded-2xl shadow-xl p-8 mb-8 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-200 transition" placeholder="Name" value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} />
              <input className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-200 transition" placeholder="Geburtsdatum" type="date" value={edit.geburtsdatum} onChange={e => setEdit({ ...edit, geburtsdatum: e.target.value })} />
              <input className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-200 transition" placeholder="Adresse" value={edit.adresse} onChange={e => setEdit({ ...edit, adresse: e.target.value })} />
              <input className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-200 transition" placeholder="Einstellungsdatum" type="date" value={edit.einstellungsdatum} onChange={e => setEdit({ ...edit, einstellungsdatum: e.target.value })} />
              <input className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-200 transition" placeholder="Position" value={edit.position} onChange={e => setEdit({ ...edit, position: e.target.value })} />
              <input className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-200 transition" placeholder="Bruttogehalt (€)" type="number" value={edit.brutto} onChange={e => setEdit({ ...edit, brutto: e.target.value })} />
              <input className="border border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-white focus:ring-2 focus:ring-blue-200 transition" placeholder="Netto (optional)" type="number" value={edit.netto} onChange={e => setEdit({ ...edit, netto: e.target.value })} />
            </div>
            {edit.brutto && (
              <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                Lohnnebenkosten (22%): <span className="font-semibold">{(parseFloat(edit.brutto) * 0.22).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span>
              </div>
            )}
            <div className="flex items-center gap-3 mt-2">
              <button
                type="button"
                className="text-gray-400 hover:text-blue-500 transition p-1"
                title={anhang[edit.id] ? 'Arbeitsvertrag anzeigen/herunterladen' : 'Arbeitsvertrag anhängen'}
                onClick={() => fileInput.current?.click()}
                style={{ lineHeight: 0 }}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M17.5 12.5l-5.5 5.5a4 4 0 01-5.7-5.7l8-8a2.5 2.5 0 113.5 3.5l-8 8a1 1 0 01-1.4-1.4l7.3-7.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <input
                type="file"
                accept="application/pdf,image/*"
                style={{ display: 'none' }}
                ref={fileInput}
                onChange={e => handleFileChange(e, edit.id)}
              />
              {anhang[edit.id] && (
                <>
                  <a
                    href={anhang[edit.id].data}
                    download={anhang[edit.id].name}
                    className="ml-1 text-blue-500 underline text-xs hover:text-blue-700"
                    style={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block', verticalAlign: 'middle' }}
                    title={anhang[edit.id].name}
                  >
                    {anhang[edit.id].name.length > 16 ? anhang[edit.id].name.slice(0, 14) + '…' : anhang[edit.id].name}
                  </a>
                  <button
                    type="button"
                    className="ml-1 text-gray-300 hover:text-red-500 transition p-1"
                    title="Anhang entfernen"
                    onClick={() => {
                      setAnhang(a => { const b = { ...a }; delete b[edit.id]; return b; });
                    }}
                    style={{ lineHeight: 0 }}
                  >
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12zM10 11v6m4-6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button className="bg-gray-900 text-white rounded-xl px-6 py-3 text-base font-semibold shadow-lg hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400" onClick={handleSave}>Speichern</button>
              <button className="bg-white border border-gray-200 rounded-xl px-6 py-3 text-base font-semibold shadow hover:bg-gray-100 transition-all text-gray-900" onClick={() => setEdit(null)}>Abbrechen</button>
            </div>
            {errorMsg && <div className="text-red-600 font-semibold mt-2 mb-2">{errorMsg}</div>}
            {successMsg && <div className="text-green-600 font-semibold mt-2 mb-2">{successMsg}</div>}
          </div>
        ) : (
          <button className="bg-blue-500 text-white rounded-xl px-6 py-3 font-semibold shadow hover:bg-blue-600 transition text-base mb-4" onClick={() => setEdit({ name: '', geburtsdatum: '', adresse: '', einstellungsdatum: '', position: '', brutto: '', netto: '' })}>Mitarbeiter anlegen</button>
        )}
        
        {/* Übersicht */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mitarbeiter.map(m => {
            const brutto = parseFloat(m.brutto) || 0;
            const lohnnebenkosten = brutto * 0.22;
            const kosten = brutto + lohnnebenkosten;
            const netto = m.netto ? parseFloat(m.netto) : Math.round(brutto * 0.62 * 100) / 100;
            return (
              <div key={m.id} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-3 border border-gray-100 relative transition hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center text-2xl font-bold text-blue-700 shadow-inner border border-blue-200">
                    {getInitialen(m.name)}
                  </div>
                  <div className="flex-1">
                    <div className="text-lg font-bold text-gray-900 mb-0.5">{m.name}</div>
                    <div className="text-gray-500 text-sm">{m.position}</div>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <button className="text-gray-400 hover:text-blue-500 p-1" title="Bearbeiten" onClick={() => setEdit(m)}>
                      <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M16.862 5.487a2.06 2.06 0 1 1 2.915 2.914l-9.193 9.193a2 2 0 0 1-.707.464l-3.11 1.037a.5.5 0 0 1-.633-.633l1.037-3.11a2 2 0 0 1 .464-.707l9.193-9.193Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button className="text-gray-300 hover:text-red-500 p-1" title="Löschen" onClick={() => handleDelete(m.id)}>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12zM10 11v6m4-6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-2">
                  <div><span className="font-semibold">Geburtsdatum:</span> {m.geburtsdatum}</div>
                  <div><span className="font-semibold">Adresse:</span> {m.adresse}</div>
                  <div><span className="font-semibold">Einstellungsdatum:</span> {m.einstellungsdatum}</div>
                </div>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mt-2">
                  <div className="text-gray-700 text-sm">Bruttogehalt: <span className="font-semibold">{brutto.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></div>
                  <div className="text-gray-700 text-sm">Lohnnebenkosten (22%): <span className="font-semibold">{lohnnebenkosten.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</span></div>
                  <div className="text-gray-900 font-bold text-lg">Monatliche Kosten: {kosten.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                </div>
                <div className="mt-2 text-blue-700 font-bold text-base">Nettogehalt: {netto.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}</div>
                {anhang[m.id] && (
                  <div className="flex items-center gap-2 mt-2">
                    <a href={anhang[m.id].data} download={anhang[m.id].name} className="text-blue-500 underline text-xs hover:text-blue-700" title={anhang[m.id].name}>Arbeitsvertrag</a>
                    <button className="text-gray-300 hover:text-red-500 p-1" title="Anhang entfernen" onClick={() => {
                      setAnhang(a => { const b = { ...a }; delete b[m.id]; return b; });
                    }}>
                      <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h12zM10 11v6m4-6v6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 
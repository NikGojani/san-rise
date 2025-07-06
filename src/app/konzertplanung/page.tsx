"use client";
import React, { useState, useEffect } from "react";
import { MagnifyingGlassIcon, MapPinIcon, CalendarIcon, FunnelIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Concert {
  id: number;
  title: string;
  city: string;
  venue: string;
  date: string;
  status: 'planned' | 'confirmed' | 'completed';
  coordinates: { lat: number; lng: number };
  tickets: number;
  sold: number;
  budget: number;
}

const initialConcerts: Concert[] = [
  {
    id: 1,
    title: "Sommerfestival München",
    city: "München",
    venue: "Olympiapark",
    date: "2024-07-15",
    status: "confirmed",
    coordinates: { lat: 48.1351, lng: 11.5820 },
    tickets: 5000,
    sold: 3200,
    budget: 150000
  },
  {
    id: 2,
    title: "Rock am Rhein",
    city: "Köln",
    venue: "Rheinpark",
    date: "2024-08-20",
    status: "planned",
    coordinates: { lat: 50.9375, lng: 6.9603 },
    tickets: 3000,
    sold: 0,
    budget: 120000
  },
  {
    id: 3,
    title: "Hamburg Harbor Nights",
    city: "Hamburg",
    venue: "HafenCity",
    date: "2024-09-10",
    status: "planned",
    coordinates: { lat: 53.5511, lng: 9.9937 },
    tickets: 4000,
    sold: 0,
    budget: 180000
  },
  {
    id: 4,
    title: "Berlin Underground",
    city: "Berlin",
    venue: "Tempelhof",
    date: "2024-06-25",
    status: "completed",
    coordinates: { lat: 52.5200, lng: 13.4050 },
    tickets: 6000,
    sold: 5800,
    budget: 200000
  }
];

export default function Konzertplanung() {
  const [concerts, setConcerts] = useState<Concert[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('concerts');
      return saved ? JSON.parse(saved) : initialConcerts;
    }
    return initialConcerts;
  });
  
  const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConcert, setNewConcert] = useState({
    title: '',
    city: '',
    venue: '',
    date: '',
    status: 'planned' as const,
    tickets: 0,
    budget: 0
  });

  // Persistenz
  useEffect(() => {
    localStorage.setItem('concerts', JSON.stringify(concerts));
  }, [concerts]);

  const filteredConcerts = concerts.filter(concert => {
    const statusMatch = filterStatus === 'all' || concert.status === filterStatus;
    const cityMatch = filterCity === '' || concert.city.toLowerCase().includes(filterCity.toLowerCase());
    return statusMatch && cityMatch;
  });

  function addConcert() {
    if (!newConcert.title || !newConcert.city || !newConcert.venue || !newConcert.date) return;

    // Einfache Koordinaten-Mapping für deutsche Städte
    const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
      'berlin': { lat: 52.5200, lng: 13.4050 },
      'hamburg': { lat: 53.5511, lng: 9.9937 },
      'münchen': { lat: 48.1351, lng: 11.5820 },
      'köln': { lat: 50.9375, lng: 6.9603 },
      'frankfurt': { lat: 50.1109, lng: 8.6821 },
      'stuttgart': { lat: 48.7758, lng: 9.1829 },
      'düsseldorf': { lat: 51.2277, lng: 6.7735 },
      'dortmund': { lat: 51.5136, lng: 7.4653 },
      'essen': { lat: 51.4556, lng: 7.0116 },
      'leipzig': { lat: 51.3397, lng: 12.3731 }
    };

    const coordinates = cityCoordinates[newConcert.city.toLowerCase()] || { lat: 51.1657, lng: 10.4515 }; // Deutschland Zentrum

    const concert: Concert = {
      id: Date.now(),
      ...newConcert,
      coordinates,
      sold: 0
    };

    setConcerts(prev => [...prev, concert]);
    setNewConcert({ title: '', city: '', venue: '', date: '', status: 'planned', tickets: 0, budget: 0 });
    setShowAddForm(false);
  }

  function deleteConcert(id: number) {
    setConcerts(prev => prev.filter(c => c.id !== id));
    if (selectedConcert?.id === id) {
      setSelectedConcert(null);
    }
  }

  function updateConcert(id: number, updates: Partial<Concert>) {
    setConcerts(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    if (selectedConcert?.id === id) {
      setSelectedConcert(prev => prev ? { ...prev, ...updates } : null);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'planned': return 'bg-yellow-100 text-yellow-700';
      case 'confirmed': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'planned': return 'Geplant';
      case 'confirmed': return 'Bestätigt';
      case 'completed': return 'Abgeschlossen';
      default: return status;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm px-4 sm:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-800">Konzertplanung</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPinIcon className="w-4 h-4" />
              <span>{filteredConcerts.length} Konzerte</span>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600"
          >
            <PlusIcon className="w-4 h-4" />
            Konzert hinzufügen
          </button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Deutschlandkarte */}
        <div className="flex-1 p-4 sm:p-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Deutschlandkarte</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FunnelIcon className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-gray-100 rounded-lg px-3 py-1 text-sm border-none outline-none"
                  >
                    <option value="all">Alle Status</option>
                    <option value="planned">Geplant</option>
                    <option value="confirmed">Bestätigt</option>
                    <option value="completed">Abgeschlossen</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Stadt suchen..."
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="bg-gray-100 rounded-lg px-3 py-1 text-sm border-none outline-none w-32"
                  />
                </div>
              </div>
            </div>

            {/* Vereinfachte Deutschlandkarte mit Pins */}
            <div className="relative bg-gray-100 rounded-2xl h-full overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-400 text-lg font-semibold">Deutschlandkarte</div>
              </div>
              
              {/* Konzert-Pins */}
              {filteredConcerts.map(concert => {
                // Vereinfachte Positionierung auf der Karte
                const x = ((concert.coordinates.lng + 15) / 30) * 100; // Deutschland: ~6° bis 15° Länge
                const y = ((55 - concert.coordinates.lat) / 10) * 100; // Deutschland: ~47° bis 55° Breite
                
                return (
                  <div
                    key={concert.id}
                    className={`absolute w-4 h-4 rounded-full cursor-pointer transform -translate-x-2 -translate-y-2 transition-all hover:scale-125 ${
                      concert.status === 'planned' ? 'bg-yellow-400' :
                      concert.status === 'confirmed' ? 'bg-blue-400' :
                      'bg-green-400'
                    } ${selectedConcert?.id === concert.id ? 'ring-4 ring-blue-200' : ''}`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onClick={() => setSelectedConcert(concert)}
                    title={`${concert.title} - ${concert.city}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Konzertliste */}
        <div className="w-full lg:w-96 bg-white border-l border-gray-100 p-4 sm:p-6 overflow-y-auto">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Konzerte</h3>
          
          <div className="space-y-3">
            {filteredConcerts.map(concert => (
              <div
                key={concert.id}
                className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                  selectedConcert?.id === concert.id 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-100 bg-gray-50'
                }`}
                onClick={() => setSelectedConcert(concert)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-800 text-sm">{concert.title}</h4>
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(concert.status)}`}>
                    {getStatusLabel(concert.status)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex items-center gap-1">
                    <MapPinIcon className="w-3 h-3" />
                    {concert.city} • {concert.venue}
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {new Date(concert.date).toLocaleDateString('de-DE')}
                  </div>
                  <div className="text-xs text-gray-600">
                    {concert.sold}/{concert.tickets} Tickets • {concert.budget.toLocaleString('de-DE')}€ Budget
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail-Panel */}
        {selectedConcert && (
          <div className="w-full lg:w-80 bg-white border-l border-gray-100 p-4 sm:p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Details</h3>
              <button
                onClick={() => deleteConcert(selectedConcert.id)}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Titel</label>
                <input
                  type="text"
                  value={selectedConcert.title}
                  onChange={(e) => updateConcert(selectedConcert.id, { title: e.target.value })}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Stadt</label>
                <input
                  type="text"
                  value={selectedConcert.city}
                  onChange={(e) => updateConcert(selectedConcert.id, { city: e.target.value })}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={selectedConcert.venue}
                  onChange={(e) => updateConcert(selectedConcert.id, { venue: e.target.value })}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Datum</label>
                <input
                  type="date"
                  value={selectedConcert.date}
                  onChange={(e) => updateConcert(selectedConcert.id, { date: e.target.value })}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={selectedConcert.status}
                  onChange={(e) => updateConcert(selectedConcert.id, { status: e.target.value as any })}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none outline-none"
                >
                  <option value="planned">Geplant</option>
                  <option value="confirmed">Bestätigt</option>
                  <option value="completed">Abgeschlossen</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tickets (Gesamt)</label>
                <input
                  type="number"
                  value={selectedConcert.tickets}
                  onChange={(e) => updateConcert(selectedConcert.id, { tickets: Number(e.target.value) })}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Verkauft</label>
                <input
                  type="number"
                  value={selectedConcert.sold}
                  onChange={(e) => updateConcert(selectedConcert.id, { sold: Number(e.target.value) })}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Budget (€)</label>
                <input
                  type="number"
                  value={selectedConcert.budget}
                  onChange={(e) => updateConcert(selectedConcert.id, { budget: Number(e.target.value) })}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none outline-none"
                />
              </div>

              {/* Kennzahlen */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Auslastung:</span>
                  <span className="font-semibold text-gray-800">
                    {selectedConcert.tickets > 0 ? Math.round((selectedConcert.sold / selectedConcert.tickets) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Verbleibend:</span>
                  <span className="font-semibold text-gray-800">
                    {selectedConcert.tickets - selectedConcert.sold} Tickets
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ticketpreis Ø:</span>
                  <span className="font-semibold text-gray-800">
                    {selectedConcert.tickets > 0 ? Math.round(selectedConcert.budget / selectedConcert.tickets) : 0}€
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Concert Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Neues Konzert</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Titel</label>
                <input
                  type="text"
                  value={newConcert.title}
                  onChange={(e) => setNewConcert(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none outline-none"
                  placeholder="Konzerttitel"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Stadt</label>
                <input
                  type="text"
                  value={newConcert.city}
                  onChange={(e) => setNewConcert(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none outline-none"
                  placeholder="Stadt"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={newConcert.venue}
                  onChange={(e) => setNewConcert(prev => ({ ...prev, venue: e.target.value }))}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none outline-none"
                  placeholder="Veranstaltungsort"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Datum</label>
                <input
                  type="date"
                  value={newConcert.date}
                  onChange={(e) => setNewConcert(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tickets</label>
                <input
                  type="number"
                  value={newConcert.tickets}
                  onChange={(e) => setNewConcert(prev => ({ ...prev, tickets: Number(e.target.value) }))}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none outline-none"
                  placeholder="Anzahl Tickets"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Budget (€)</label>
                <input
                  type="number"
                  value={newConcert.budget}
                  onChange={(e) => setNewConcert(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  className="w-full bg-gray-100 rounded-lg px-3 py-2 text-sm border-none outline-none"
                  placeholder="Budget in Euro"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
              >
                Abbrechen
              </button>
              <button
                onClick={addConcert}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600"
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
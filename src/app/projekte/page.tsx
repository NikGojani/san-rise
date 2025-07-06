"use client";
import React, { useState } from "react";
import { PlusIcon, BellIcon, UserCircleIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const initialTasks = [
  { id: 1, title: "Location Recherche", assigned: "Nik", due: "15.08.", progress: 0, status: "todo" },
  { id: 2, title: "Ticketpreise kalkulieren", assigned: "Adrian", due: "18.08.", progress: 0, status: "todo" },
  { id: 3, title: "Sponsoren anfragen", assigned: "Stury", due: "20.08.", progress: 0, status: "todo" },
  { id: 4, title: "Social Media Konzept erstellen", assigned: "Peen", due: "22.08.", progress: 0, status: "todo" },
];

const columns = [
  { key: "todo", label: "To Do" },
  { key: "inprogress", label: "In Progress" },
  { key: "done", label: "Done" },
];

export default function Projekte() {
  const [tasks, setTasks] = useState(initialTasks);
  const [dragged, setDragged] = useState<number | null>(null);

  function onDragStart(id: number) { setDragged(id); }
  function onDrop(status: string) {
    if (dragged !== null) {
      setTasks(tasks => tasks.map(t => t.id === dragged ? { ...t, status } : t));
      setDragged(null);
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Seitenleiste */}
      <aside className="w-20 sm:w-24 bg-white border-r border-gray-100 flex flex-col items-center py-6 gap-8 shadow-sm">
        <img src="/WhatsApp%20Image%202025-07-05%20at%2004.18.38.jpeg" alt="Logo" className="w-10 h-10 rounded-xl mb-4" style={{ filter: 'invert(1)' }} />
        <nav className="flex flex-col gap-8 items-center w-full">
          <SidebarIcon active label="Dashboard" />
          <SidebarIcon label="Projekte" />
          <SidebarIcon label="Aufgaben" />
          <SidebarIcon label="Kalender" />
          <SidebarIcon label="Einstellungen" />
        </nav>
      </aside>
      {/* Hauptbereich */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 w-full max-w-xs">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            <input className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none" placeholder="Suche..." />
          </div>
          <div className="flex items-center gap-4">
            <BellIcon className="w-6 h-6 text-gray-400" />
            <UserCircleIcon className="w-8 h-8 text-gray-400" />
          </div>
        </header>
        {/* Kanban-Board */}
        <section className="flex-1 flex flex-col sm:flex-row gap-4 p-4 sm:p-8 overflow-x-auto">
          {columns.map(col => (
            <div
              key={col.key}
              className="flex-1 min-w-[260px] bg-white rounded-2xl shadow p-4 flex flex-col gap-4"
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(col.key)}
            >
              <div className="font-bold text-lg mb-2 text-gray-800">{col.label}</div>
              {tasks.filter(t => t.status === col.key).map(task => (
                <div
                  key={task.id}
                  className="bg-gray-50 rounded-xl p-4 shadow flex flex-col gap-2 cursor-grab border border-gray-100"
                  draggable
                  onDragStart={() => onDragStart(task.id)}
                >
                  <input
                    className="text-lg font-bold bg-transparent outline-none w-full"
                    value={task.title}
                    onChange={e => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, title: e.target.value } : t))}
                  />
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Zugewiesen an:</span>
                    <input
                      className="bg-transparent border-b border-gray-200 outline-none w-20 text-gray-700 font-semibold"
                      value={task.assigned}
                      onChange={e => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, assigned: e.target.value } : t))}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Fällig:</span>
                    <input
                      className="bg-transparent border-b border-gray-200 outline-none w-16 text-gray-700 font-semibold"
                      value={task.due}
                      onChange={e => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, due: e.target.value } : t))}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Fortschritt:</span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={task.progress}
                      onChange={e => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, progress: Number(e.target.value) } : t))}
                      className="w-24"
                    />
                    <span className="font-bold text-gray-700">{task.progress}%</span>
                  </div>
                </div>
              ))}
              <button className="mt-2 flex items-center gap-2 text-blue-500 hover:underline text-sm font-semibold"><PlusIcon className="w-4 h-4" /> Aufgabe hinzufügen</button>
            </div>
          ))}
        </section>
        {/* Zeiterfassungs-Panel (nur Grundgerüst) */}
        <aside className="fixed right-0 top-0 h-full w-72 bg-white border-l border-gray-100 shadow-lg p-6 flex flex-col gap-4 z-50 hidden sm:flex">
          <div className="font-bold text-lg mb-2">Zeiterfassung</div>
          <div className="text-gray-500 text-sm">(Kommt im nächsten Schritt!)</div>
        </aside>
      </main>
    </div>
  );
}

function SidebarIcon({ label, active }: { label: string; active?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 text-xs font-semibold ${active ? "text-blue-600" : "text-gray-400"}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${active ? "bg-blue-50" : "bg-gray-100"}`}>{label[0]}</div>
      <span>{label}</span>
    </div>
  );
} 
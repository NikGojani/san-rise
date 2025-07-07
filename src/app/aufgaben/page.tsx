"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, ListBulletIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

const initialTasks = [
  { id: 1, title: "Location Recherche", assigned: "Nik", due: "2024-08-15", status: "todo", priority: "mittel", category: "Orga" },
  { id: 2, title: "Ticketpreise kalkulieren", assigned: "Adrian", due: "2024-08-18", status: "todo", priority: "hoch", category: "Finanzen" },
  { id: 3, title: "Sponsoren anfragen", assigned: "Stury", due: "2024-08-20", status: "inprogress", priority: "niedrig", category: "Marketing" },
  { id: 4, title: "Social Media Konzept erstellen", assigned: "Peen", due: "2024-08-22", status: "done", priority: "mittel", category: "Marketing" },
];

const priorities = [
  { value: "hoch", label: "Hoch", color: "bg-red-500 text-white" },
  { value: "mittel", label: "Mittel", color: "bg-yellow-400 text-gray-900" },
  { value: "niedrig", label: "Niedrig", color: "bg-green-500 text-white" },
];

export default function Aufgaben() {
  const [tasks, setTasks] = useState(initialTasks);
  const [view, setView] = useState<'list' | 'card'>("card");
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState(["Alle", "Orga", "Finanzen", "Marketing"]);
  const [selectedCategory, setSelectedCategory] = useState("Alle");

  useEffect(() => {
    const saved = localStorage.getItem("categories");
    if (saved) setCategories(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  const filtered = tasks.filter(t =>
    (selectedCategory === "Alle" || t.category === selectedCategory) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.assigned.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 shadow-sm px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Aufgaben</h1>
        <div className="flex items-center gap-2 w-full max-w-xs">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          <input
            className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-200 outline-none"
            placeholder="Suche Aufgaben oder Personen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('list')} className={`p-2 rounded-xl ${view === 'list' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}><ListBulletIcon className="w-5 h-5" /></button>
          <button onClick={() => setView('card')} className={`p-2 rounded-xl ${view === 'card' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}><Squares2X2Icon className="w-5 h-5" /></button>
        </div>
      </header>
      <nav className="flex gap-2 px-4 sm:px-8 py-2 bg-white border-b border-gray-100">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xl font-semibold text-sm ${selectedCategory === cat ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => {
            const newCategory = prompt("Neue Kategorie eingeben:");
            if (newCategory && !categories.includes(newCategory)) {
              setCategories([...categories, newCategory]);
              setSelectedCategory(newCategory);
            }
          }}
          className="px-3 py-1 rounded-xl font-semibold text-sm bg-gray-100 text-gray-700"
        >
          + Kategorie
        </button>
      </nav>
      <main className="p-4 sm:p-8">
        {view === 'list' ? (
          <table className="w-full bg-white rounded-2xl shadow overflow-hidden">
            <thead>
              <tr className="text-left text-gray-500 text-sm">
                <th className="p-3">Titel</th>
                <th className="p-3">Verantwortlich</th>
                <th className="p-3">Deadline</th>
                <th className="p-3">Priorität</th>
                <th className="p-3">Kategorie</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => (
                <tr key={task.id} className="border-t border-gray-100 hover:bg-blue-50 transition">
                  <td className="p-3 font-semibold">{task.title}</td>
                  <td className="p-3">{task.assigned}</td>
                  <td className="p-3">{task.due}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded font-bold text-xs ${priorities.find(p => p.value === task.priority)?.color}`}>{task.priority}</span>
                  </td>
                  <td className="p-3">{task.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map(task => (
              <div key={task.id} className="bg-white rounded-2xl shadow p-4 flex flex-col gap-2 border border-gray-100">
                <div className="text-lg font-bold">{task.title}</div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Verantwortlich:</span>
                  <span className="font-semibold text-gray-700">{task.assigned}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Deadline:</span>
                  <span className="font-semibold text-gray-700">{task.due}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Priorität:</span>
                  <span className={`px-2 py-1 rounded font-bold text-xs ${priorities.find(p => p.value === task.priority)?.color}`}>{task.priority}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Kategorie:</span>
                  <span className="font-semibold text-gray-700">{task.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 
"use client";
import React, { useState, useEffect } from "react";
import { PlusIcon, BellIcon, UserCircleIcon, MagnifyingGlassIcon, PlayIcon, PauseIcon, StopIcon, TrashIcon } from "@heroicons/react/24/outline";
import Sidebar from "../Sidebar";

interface Task {
  id: number;
  title: string;
  assigned: string;
  due: string;
  progress: number;
  status: string;
  priority: string;
  projectId: number;
  drive: string;
}

interface Project {
  id: number;
  name: string;
}

const initialProjects: Project[] = [
  { id: 1, name: "Anime Night" },
  { id: 2, name: "Sommer Open Air" },
];

const initialTasks = [
  { id: 1, title: "Location Recherche", assigned: "Nik", due: "2024-08-15", progress: 0, status: "todo", priority: "mittel", projectId: 1, drive: "" },
  { id: 2, title: "Ticketpreise kalkulieren", assigned: "Adrian", due: "2024-08-18", progress: 0, status: "todo", priority: "hoch", projectId: 1, drive: "" },
  { id: 3, title: "Sponsoren anfragen", assigned: "Stury", due: "2024-08-20", progress: 0, status: "todo", priority: "niedrig", projectId: 2, drive: "" },
  { id: 4, title: "Social Media Konzept erstellen", assigned: "Peen", due: "2024-08-22", progress: 0, status: "todo", priority: "mittel", projectId: 2, drive: "" },
];

const priorities = [
  { value: "hoch", label: "Hoch", color: "bg-red-500 text-white" },
  { value: "mittel", label: "Mittel", color: "bg-yellow-400 text-gray-900" },
  { value: "niedrig", label: "Niedrig", color: "bg-green-500 text-white" },
];

const users = ["Nik", "Adrian", "Stury", "Peen"];

const columns = [
  { key: "todo", label: "To Do" },
  { key: "inprogress", label: "In Progress" },
  { key: "done", label: "Done" },
];

export default function Aufgaben() {
  const [tasks, setTasks] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tasks');
      return saved ? JSON.parse(saved) : initialTasks;
    }
    return initialTasks;
  });
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [dragged, setDragged] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  function onDragStart(id: number) { setDragged(id); }
  function onDrop(status: string) {
    if (dragged !== null) {
      setTasks(tasks => tasks.map(t => t.id === dragged ? { ...t, status } : t));
      setDragged(null);
    }
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-gray-100 shadow-sm" style={{borderRadius: '18px 18px 0 0', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: '1.5rem', marginTop: '1.5rem'}}>
          <h1 className="text-2xl font-bold text-gray-800" style={{letterSpacing: '-0.01em'}}>Aufgaben</h1>
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
                    <select
                      className="bg-transparent border-b border-gray-200 outline-none w-20 text-gray-700 font-semibold"
                      value={task.assigned}
                      onChange={e => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, assigned: e.target.value } : t))}
                    >
                      {users.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Deadline:</span>
                    <input
                      type="date"
                      className="bg-transparent border-b border-gray-200 outline-none w-28 text-gray-700 font-semibold"
                      value={task.due}
                      onChange={e => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, due: e.target.value } : t))}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Priorität:</span>
                    <select
                      className={`rounded px-2 py-1 font-bold ${priorities.find(p => p.value === task.priority)?.color}`}
                      value={task.priority}
                      onChange={e => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, priority: e.target.value } : t))}
                    >
                      {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Projekt:</span>
                    <select
                      className="bg-transparent border-b border-gray-200 outline-none w-32 text-gray-700 font-semibold"
                      value={task.projectId}
                      onChange={e => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, projectId: Number(e.target.value) } : t))}
                    >
                      {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Drive-Link:</span>
                    <input
                      type="url"
                      className="bg-transparent border-b border-gray-200 outline-none w-full text-blue-700 font-semibold"
                      value={task.drive}
                      onChange={e => setTasks(ts => ts.map(t => t.id === task.id ? { ...t, drive: e.target.value } : t))}
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                </div>
              ))}
              <button className="mt-2 flex items-center gap-2 text-blue-500 hover:underline text-sm font-semibold">
                <PlusIcon className="w-4 h-4" /> Aufgabe hinzufügen
              </button>
            </div>
          ))}
        </section>
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
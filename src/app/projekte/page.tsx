"use client";
import React, { useState, useEffect } from "react";
import { PlusIcon, BellIcon, UserCircleIcon, MagnifyingGlassIcon, PlayIcon, PauseIcon, StopIcon, TrashIcon } from "@heroicons/react/24/outline";

interface Task {
  id: number;
  title: string;
  assigned: string;
  due: string;
  progress: number;
  status: string;
}

interface TimeEntry {
  id: number;
  taskId: number;
  taskTitle: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  isRunning: boolean;
}

const initialTasks: Task[] = [
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
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tasks');
      return saved ? JSON.parse(saved) : initialTasks;
    }
    return initialTasks;
  });
  
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('timeEntries');
      return saved ? JSON.parse(saved).map((entry: any) => ({
        ...entry,
        startTime: new Date(entry.startTime),
        endTime: entry.endTime ? new Date(entry.endTime) : undefined
      })) : [];
    }
    return [];
  });
  
  const [dragged, setDragged] = useState<number | null>(null);
  const [currentTimer, setCurrentTimer] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Persistenz
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  // Timer-Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentTimer && currentTimer.isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentTimer]);

  function onDragStart(id: number) { setDragged(id); }
  
  function onDrop(status: string) {
    if (dragged !== null) {
      setTasks(tasks => tasks.map(t => t.id === dragged ? { ...t, status } : t));
      setDragged(null);
    }
  }

  function startTimer(taskId: number) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Stoppe aktuellen Timer falls läuft
    if (currentTimer && currentTimer.isRunning) {
      stopTimer();
    }

    const newEntry: TimeEntry = {
      id: Date.now(),
      taskId,
      taskTitle: task.title,
      startTime: new Date(),
      duration: 0,
      isRunning: true
    };

    setCurrentTimer(newEntry);
    setTimeEntries(prev => [...prev, newEntry]);
    setElapsedTime(0);
  }

  function pauseTimer() {
    if (!currentTimer) return;
    
    setCurrentTimer(prev => prev ? { ...prev, isRunning: false } : null);
  }

  function resumeTimer() {
    if (!currentTimer) return;
    
    setCurrentTimer(prev => prev ? { ...prev, isRunning: true } : null);
  }

  function stopTimer() {
    if (!currentTimer) return;

    const updatedEntry: TimeEntry = {
      ...currentTimer,
      endTime: new Date(),
      duration: elapsedTime,
      isRunning: false
    };

    setTimeEntries(prev => prev.map(entry => 
      entry.id === currentTimer.id ? updatedEntry : entry
    ));
    setCurrentTimer(null);
    setElapsedTime(0);
  }

  function deleteTimeEntry(entryId: number) {
    setTimeEntries(prev => prev.filter(entry => entry.id !== entryId));
    if (currentTimer?.id === entryId) {
      setCurrentTimer(null);
      setElapsedTime(0);
    }
  }

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function getTotalTimeForTask(taskId: number): number {
    return timeEntries
      .filter(entry => entry.taskId === taskId)
      .reduce((total, entry) => total + entry.duration, 0);
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
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Zeit:</span>
                    <span className="font-bold text-gray-700">{formatTime(getTotalTimeForTask(task.id))}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {currentTimer?.taskId === task.id && currentTimer.isRunning ? (
                      <button
                        onClick={pauseTimer}
                        className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-semibold hover:bg-yellow-200"
                      >
                        <PauseIcon className="w-3 h-3" />
                        Pause
                      </button>
                    ) : currentTimer?.taskId === task.id && !currentTimer.isRunning ? (
                      <button
                        onClick={resumeTimer}
                        className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200"
                      >
                        <PlayIcon className="w-3 h-3" />
                        Weiter
                      </button>
                    ) : (
                      <button
                        onClick={() => startTimer(task.id)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200"
                      >
                        <PlayIcon className="w-3 h-3" />
                        Start
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button className="mt-2 flex items-center gap-2 text-blue-500 hover:underline text-sm font-semibold">
                <PlusIcon className="w-4 h-4" /> Aufgabe hinzufügen
              </button>
            </div>
          ))}
        </section>
        
        {/* Zeiterfassungs-Panel */}
        <aside className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-100 shadow-lg p-6 flex flex-col gap-4 z-50 hidden lg:flex">
          <div className="font-bold text-xl mb-4 text-gray-800">Zeiterfassung</div>
          
          {/* Aktueller Timer */}
          {currentTimer && (
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <div className="text-sm text-blue-600 font-semibold mb-2">Aktuell läuft:</div>
              <div className="text-lg font-bold text-blue-800 mb-2">{currentTimer.taskTitle}</div>
              <div className="text-3xl font-mono text-blue-900 mb-3">
                {formatTime(elapsedTime)}
              </div>
              <div className="flex gap-2">
                {currentTimer.isRunning ? (
                  <button
                    onClick={pauseTimer}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600"
                  >
                    <PauseIcon className="w-4 h-4" />
                    Pause
                  </button>
                ) : (
                  <button
                    onClick={resumeTimer}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600"
                  >
                    <PlayIcon className="w-4 h-4" />
                    Weiter
                  </button>
                )}
                <button
                  onClick={stopTimer}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600"
                >
                  <StopIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {/* Zeiteinträge */}
          <div className="flex-1 overflow-y-auto">
            <div className="text-sm font-semibold text-gray-700 mb-3">Zeiteinträge</div>
            <div className="space-y-3">
              {timeEntries
                .filter(entry => !entry.isRunning)
                .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                .map(entry => (
                  <div key={entry.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 text-sm">{entry.taskTitle}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.startTime).toLocaleDateString('de-DE')} {new Date(entry.startTime).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-sm font-bold text-gray-700 mt-1">
                          {formatTime(entry.duration)}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTimeEntry(entry.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          
          {/* Zusammenfassung */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="text-sm font-semibold text-gray-700 mb-2">Heute</div>
            <div className="text-lg font-bold text-gray-800">
              {formatTime(
                timeEntries
                  .filter(entry => {
                    const today = new Date();
                    const entryDate = new Date(entry.startTime);
                    return entryDate.toDateString() === today.toDateString();
                  })
                  .reduce((total, entry) => total + entry.duration, 0)
              )}
            </div>
          </div>
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
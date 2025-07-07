"use client";
import React, { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

type Task = {
  id: number;
  title: string;
  assigned: string;
  due: string;
  priority: string;
  category: string;
};

const initialTasks: Task[] = [
  { id: 1, title: "Location Recherche", assigned: "Nik", due: "2024-08-15", priority: "mittel", category: "Orga" },
  { id: 2, title: "Ticketpreise kalkulieren", assigned: "Adrian", due: "2024-08-18", priority: "hoch", category: "Finanzen" },
  { id: 3, title: "Sponsoren anfragen", assigned: "Stury", due: "2024-08-20", priority: "niedrig", category: "Marketing" },
  { id: 4, title: "Social Media Konzept erstellen", assigned: "Peen", due: "2024-08-22", priority: "mittel", category: "Marketing" },
];

const priorities = [
  { value: "hoch", label: "Hoch", color: "bg-red-500 text-white" },
  { value: "mittel", label: "Mittel", color: "bg-yellow-400 text-gray-900" },
  { value: "niedrig", label: "Niedrig", color: "bg-green-500 text-white" },
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function Kalender() {
  const [tasks] = useState<Task[]>(initialTasks);
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  }
  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
    }
  }

  function formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  // Aufgaben nach Datum gruppieren
  const tasksByDate: Record<string, typeof tasks> = {};
  tasks.forEach(task => {
    if (!tasksByDate[task.due]) tasksByDate[task.due] = [];
    tasksByDate[task.due].push(task);
  });

  const monthNames = [
    "Januar", "Februar", "März", "April", "Mai", "Juni",
    "Juli", "August", "September", "Oktober", "November", "Dezember"
  ];
  const weekDays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

  // Platzhalter für Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-gray-200"><ChevronLeftIcon className="w-5 h-5" /></button>
          <h1 className="text-2xl font-bold text-gray-800">{monthNames[month]} {year}</h1>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-gray-200"><ChevronRightIcon className="w-5 h-5" /></button>
        </div>
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-gray-400 font-semibold">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array(firstDay).fill(null).map((_, i) => <div key={i} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const date = new Date(year, month, i + 1);
            const dateStr = formatDate(date);
            const dayTasks = tasksByDate[dateStr] || [];
            return (
              <div key={i} className={`bg-white rounded-2xl shadow p-2 min-h-[80px] flex flex-col gap-1 border border-gray-100 ${dateStr === formatDate(today) ? 'ring-2 ring-blue-200' : ''}`}>
                <div className="text-xs text-gray-400 mb-1 font-semibold">{i + 1}</div>
                {dayTasks.map(task => (
                  <div
                    key={task.id}
                    className={`rounded-xl px-2 py-1 text-xs font-semibold cursor-pointer flex items-center gap-2 ${priorities.find(p => p.value === task.priority)?.color}`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <span>{task.title}</span>
                    <span className="ml-auto">{task.assigned}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        {/* Modal Platzhalter */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-xl min-w-[300px] max-w-xs">
              <div className="font-bold text-lg mb-2">{selectedTask.title}</div>
              <div className="mb-1">Verantwortlich: <span className="font-semibold">{selectedTask.assigned}</span></div>
              <div className="mb-1">Deadline: <span className="font-semibold">{selectedTask.due}</span></div>
              <div className="mb-1">Priorität: <span className={`px-2 py-1 rounded font-bold text-xs ${priorities.find(p => p.value === selectedTask.priority)?.color}`}>{selectedTask.priority}</span></div>
              <div className="mb-1">Kategorie: <span className="font-semibold">{selectedTask.category}</span></div>
              <button onClick={() => setSelectedTask(null)} className="mt-4 w-full bg-blue-500 text-white rounded-xl py-2 font-semibold">Schließen</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
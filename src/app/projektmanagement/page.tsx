"use client";
import React, { useState, useEffect } from "react";
import { PlusIcon, MagnifyingGlassIcon, TrashIcon, ClipboardIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

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

export default function Projektmanagement() {
  const [tasks, setTasks] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tasks');
      return saved ? JSON.parse(saved) : initialTasks;
    }
    return initialTasks;
  });
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [dragged, setDragged] = useState<number | null>(null);
  const [view, setView] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [sortBy, setSortBy] = useState<'title' | 'priority' | 'due' | 'assigned' | 'project' | 'status'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [editingTask, setEditingTask] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [copySuccess, setCopySuccess] = useState<number | null>(null);
  const [prevStatus, setPrevStatus] = useState<{ [id: number]: string }>({});

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

  function onCalendarDrop(dateStr: string) {
    if (dragged !== null) {
      setTasks(tasks => tasks.map(t => t.id === dragged ? { ...t, due: dateStr } : t));
      setDragged(null);
    }
  }

  function addTask(status: string) {
    const newTask = {
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      title: "Neue Aufgabe",
      assigned: "Nik",
      due: new Date().toISOString().split('T')[0],
      progress: 0,
      status: status,
      priority: "mittel",
      projectId: 1,
      drive: ""
    };
    setTasks([...tasks, newTask]);
  }

  function addTaskToTodo() {
    addTask('todo');
  }

  function handleTaskEdit(taskId: number) {
    setEditingTask(taskId);
  }

  function handleTaskSave(taskId: number) {
    setEditingTask(null);
  }

  function updateTask(taskId: number, field: string, value: any) {
    setTasks(tasks => tasks.map(t => t.id === taskId ? { ...t, [field]: value } : t));
  }

  function deleteTask(taskId: number) {
    if (window.confirm('Bist du sicher, dass du diese Aufgabe löschen möchtest?')) {
      setTasks(tasks => tasks.filter(t => t.id !== taskId));
    }
  }

  function getPersonColor(person: string) {
    switch (person) {
      case 'Stury': return 'bg-green-500';
      case 'Adrian': return 'bg-blue-500';
      case 'Nik': return 'bg-red-500';
      case 'Peen': return 'bg-yellow-400';
      default: return 'bg-gray-300';
    }
  }

  function getPersonTextColor(person: string) {
    switch (person) {
      case 'Peen': return 'text-gray-900';
      default: return 'text-white';
    }
  }

  function filterTasks(tasksToFilter: any[]) {
    if (!searchQuery.trim()) return tasksToFilter;
    
    const query = searchQuery.toLowerCase();
    return tasksToFilter.filter(task => {
      const title = task.title.toLowerCase();
      const assigned = task.assigned.toLowerCase();
      const project = projects.find(p => p.id === task.projectId)?.name.toLowerCase() || '';
      const due = task.due.toLowerCase();
      const priority = priorities.find(p => p.value === task.priority)?.label.toLowerCase() || '';
      const status = task.status.toLowerCase();
      const drive = task.drive.toLowerCase();
      
      return title.includes(query) || 
             assigned.includes(query) || 
             project.includes(query) || 
             due.includes(query) || 
             priority.includes(query) || 
             status.includes(query) || 
             drive.includes(query);
    });
  }

  function sortTasks(tasksToSort: any[]) {
    return [...tasksToSort].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'priority':
          const priorityOrder = { 'hoch': 3, 'mittel': 2, 'niedrig': 1 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
          break;
        case 'due':
          aValue = new Date(a.due).getTime();
          bValue = new Date(b.due).getTime();
          break;
        case 'assigned':
          aValue = a.assigned.toLowerCase();
          bValue = b.assigned.toLowerCase();
          break;
        case 'project':
          const projectA = projects.find(p => p.id === a.projectId)?.name || '';
          const projectB = projects.find(p => p.id === b.projectId)?.name || '';
          aValue = projectA.toLowerCase();
          bValue = projectB.toLowerCase();
          break;
        case 'status':
          const statusOrder = { 'todo': 1, 'inprogress': 2, 'done': 3 };
          aValue = statusOrder[a.status as keyof typeof statusOrder] || 0;
          bValue = statusOrder[b.status as keyof typeof statusOrder] || 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  function handleSort(column: typeof sortBy) {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }

  const sortedTasks = sortTasks(filterTasks(tasks));
  const filteredTasks = filterTasks(tasks);

  function getWeekRange(date: Date) {
    const start = new Date(date);
    start.setDate(date.getDate() - ((date.getDay() + 6) % 7));
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end };
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'hoch': return 'bg-red-500 text-white';
      case 'mittel': return 'bg-yellow-400 text-gray-900';
      case 'niedrig': return 'bg-green-500 text-white';
      default: return 'bg-gray-200 text-gray-700';
    }
  }

  function handleCopy(link: string, id: number) {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  }

  function handleToggleDone(task: any) {
    if (task.status === 'done') {
      const prev = prevStatus[task.id] || 'todo';
      setPrevStatus(ps => {
        const copy = { ...ps };
        delete copy[task.id];
        return copy;
      });
      updateTask(task.id, 'status', prev);
    } else {
      setPrevStatus(ps => ({ ...ps, [task.id]: task.status }));
      updateTask(task.id, 'status', 'done');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 sm:px-8 py-4 bg-white border-b border-gray-100 shadow-sm" style={{borderRadius: '18px 18px 0 0', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: '1.5rem', marginTop: '1.5rem'}}>
          <h1 className="text-2xl font-bold text-gray-800" style={{letterSpacing: '-0.01em'}}>Projektmanagement</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder=""
                className="w-64 bg-gray-50 rounded-xl pl-10 pr-4 py-2 text-gray-900 border border-gray-200 focus:ring-2 focus:ring-blue-100 transition placeholder-gray-400"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className={`px-3 py-1.5 rounded-xl font-semibold text-sm shadow-sm border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all ${view === 'kanban' ? 'text-blue-600' : 'text-gray-500'}`}
              onClick={() => setView('kanban')}
            >Karten</button>
            <button
              className={`px-3 py-1.5 rounded-xl font-semibold text-sm shadow-sm border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all ${view === 'list' ? 'text-blue-600' : 'text-gray-500'}`}
              onClick={() => setView('list')}
            >Liste</button>
            <button
              className={`px-3 py-1.5 rounded-xl font-semibold text-sm shadow-sm border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all ${view === 'calendar' ? 'text-blue-600' : 'text-gray-500'}`}
              onClick={() => setView('calendar')}
            >Kalender</button>
            <button
              className="px-3 py-1.5 rounded-xl font-semibold text-sm shadow-sm border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-all text-blue-600 flex items-center gap-1"
              onClick={addTaskToTodo}
            >
              <PlusIcon className="w-4 h-4" />
              Aufgabe hinzufügen
            </button>
          </div>
        </header>
        {/* Board-Ansicht */}
        {view === 'kanban' ? (
          <section className="flex-1 flex flex-col sm:flex-row gap-4 p-2 sm:p-6 overflow-x-auto">
          {columns.map(col => (
            <div
              key={col.key}
                className="flex-1 min-w-[220px] bg-white rounded-2xl shadow-sm p-2 flex flex-col gap-2 border border-gray-100"
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(col.key)}
            >
                <div className="font-bold text-base mb-1 text-gray-900 pl-2 pt-2">{col.label}</div>
                {filteredTasks.filter(t => t.status === col.key).map(task => (
                <div
                  key={task.id}
                    className="bg-gray-50 rounded-xl p-3 shadow-sm flex flex-col gap-2 cursor-grab border border-gray-100 hover:shadow-md transition-all relative"
                  draggable
                  onDragStart={() => onDragStart(task.id)}
                    onDoubleClick={() => handleTaskEdit(task.id)}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        className="text-base font-semibold bg-transparent outline-none w-full text-gray-800"
                        value={task.title}
                        onChange={e => updateTask(task.id, 'title', e.target.value)}
                      />
                      <span className={`rounded px-2 py-0.5 text-xs font-bold ${priorities.find(p => p.value === task.priority)?.color}`}>{priorities.find(p => p.value === task.priority)?.label}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>{users.includes(task.assigned) ? task.assigned : ''}</span>
                      <span className="text-gray-300">•</span>
                      <span>{task.due}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTask(task.id);
                      }}
                      className="absolute bottom-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors opacity-0 hover:opacity-100"
                      title="Aufgabe löschen"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </section>
        ) : view === 'list' ? (
          // Listenansicht
          <section className="flex-1 flex flex-col gap-2 p-2 sm:p-6 overflow-x-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
              <div className="grid grid-cols-8 gap-2 px-2 py-1 text-xs font-bold text-gray-500 border-b border-gray-100">
                <div></div>
                <button 
                  className="text-left hover:text-gray-700 transition-colors flex items-center gap-1"
                  onClick={() => handleSort('title')}
                >
                  Titel
                  {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  className="text-left hover:text-gray-700 transition-colors flex items-center gap-1"
                  onClick={() => handleSort('priority')}
                >
                  Priorität
                  {sortBy === 'priority' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  className="text-left hover:text-gray-700 transition-colors flex items-center gap-1"
                  onClick={() => handleSort('assigned')}
                >
                  Zugewiesen
                  {sortBy === 'assigned' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  className="text-left hover:text-gray-700 transition-colors flex items-center gap-1"
                  onClick={() => handleSort('due')}
                >
                  Deadline
                  {sortBy === 'due' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  className="text-left hover:text-gray-700 transition-colors flex items-center gap-1"
                  onClick={() => handleSort('status')}
                >
                  Status
                  {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <div>Drive</div>
              </div>
              {sortedTasks.map(task => (
                <div key={task.id} className="grid grid-cols-8 gap-2 px-2 py-2 items-center border-b border-gray-50 hover:bg-gray-50 rounded-xl transition-all relative">
                  <button
                    className="flex items-center justify-center"
                    title={task.status === 'done' ? 'Als unerledigt markieren' : 'Als erledigt markieren'}
                    onClick={() => handleToggleDone(task)}
                  >
                    {task.status === 'done' ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <span className="inline-block w-5 h-5 border-2 border-gray-300 rounded-full bg-white"></span>
                    )}
                  </button>
                  <input
                    className="text-sm font-semibold bg-transparent outline-none w-full text-gray-800"
                    value={task.title}
                    onChange={e => updateTask(task.id, 'title', e.target.value)}
                  />
                  <select
                    className={`border-b border-gray-200 outline-none w-full font-semibold text-xs rounded px-2 py-1 ${getPriorityColor(task.priority)}`}
                    value={task.priority}
                    onChange={e => updateTask(task.id, 'priority', e.target.value)}
                  >
                    {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                    <select
                    className="bg-transparent border-b border-gray-200 outline-none w-full text-gray-700 font-semibold text-xs"
                      value={task.assigned}
                    onChange={e => updateTask(task.id, 'assigned', e.target.value)}
                    >
                      {users.map(u => <option key={u}>{u}</option>)}
                    </select>
                    <input
                      type="date"
                    className="bg-transparent border-b border-gray-200 outline-none w-full text-gray-700 font-semibold text-xs"
                      value={task.due}
                    onChange={e => updateTask(task.id, 'due', e.target.value)}
                  />
                  <select
                    className="bg-transparent border-b border-gray-200 outline-none w-full text-gray-700 font-semibold text-xs"
                    value={task.status}
                    onChange={e => updateTask(task.id, 'status', e.target.value)}
                  >
                    <option value="todo">Todo</option>
                    <option value="inprogress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <div className="flex items-center gap-2 w-[320px] max-w-[340px]">
                    <div className="flex-1 min-w-0">
                      <input
                        type="url"
                        className="bg-transparent border-b border-gray-200 outline-none w-full text-blue-700 font-semibold text-xs pr-8"
                        value={task.drive}
                        onChange={e => updateTask(task.id, 'drive', e.target.value)}
                        placeholder="https://drive.google.com/..."
                      />
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {task.drive && task.drive.length > 0 && (
                        <button
                          onClick={() => handleCopy(task.drive, task.id)}
                          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                          title="Link kopieren"
                        >
                          <ClipboardIcon className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Aufgabe löschen"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {/* Copy-Feedback */}
                  {copySuccess === task.id && (
                    <div className="absolute right-2 top-2 bg-blue-500 text-white text-xs rounded px-2 py-1 shadow z-50 animate-fade-in">
                      Link kopiert!
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : (
          // Kalenderansicht
          <section className="flex-1 flex flex-col gap-4 p-2 sm:p-6 overflow-x-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {/* Monats-/Wochenansicht Umschalter */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  className={`px-3 py-1.5 rounded-xl font-semibold text-sm shadow-sm border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all ${calendarView === 'month' ? 'text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setCalendarView('month')}
                >Monat</button>
                <button
                  className={`px-3 py-1.5 rounded-xl font-semibold text-sm shadow-sm border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all ${calendarView === 'week' ? 'text-blue-600' : 'text-gray-500'}`}
                  onClick={() => setCalendarView('week')}
                >Woche</button>
              </div>
              {/* Navigation und Anzeige */}
              <div className="flex items-center justify-between mb-6">
                {calendarView === 'month' ? (
                  <>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="px-3 py-1.5 rounded-xl font-semibold text-sm shadow-sm border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all text-gray-600"
                    >
                      ← Vorheriger Monat
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">
                      {currentMonth.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
                    </h2>
                    <button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="px-3 py-1.5 rounded-xl font-semibold text-sm shadow-sm border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all text-gray-600"
                    >
                      Nächster Monat →
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        const prev = new Date(currentMonth);
                        prev.setDate(currentMonth.getDate() - 7);
                        setCurrentMonth(prev);
                      }}
                      className="px-3 py-1.5 rounded-xl font-semibold text-sm shadow-sm border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all text-gray-600"
                    >
                      ← Vorherige Woche
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">
                      {(() => {
                        const { start, end } = getWeekRange(currentMonth);
                        const startStr = start.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        const endStr = end.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        return `${startStr} – ${endStr}`;
                      })()}
                    </h2>
                    <button
                      onClick={() => {
                        const next = new Date(currentMonth);
                        next.setDate(currentMonth.getDate() + 7);
                        setCurrentMonth(next);
                      }}
                      className="px-3 py-1.5 rounded-xl font-semibold text-sm shadow-sm border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-all text-gray-600"
                    >
                      Nächste Woche →
                    </button>
                  </>
                )}
              </div>
              
              {/* Legende */}
              <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-semibold text-gray-700">Legende:</span>
                {['Stury', 'Adrian', 'Nik', 'Peen'].map(person => (
                  <div key={person} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getPersonColor(person)}`}></div>
                    <span className="text-sm text-gray-600">{person}</span>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-4">
                {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                    {day}
                  </div>
                ))}
                {(() => {
                  const today = new Date();
                  let days = [];
                  if (calendarView === 'month') {
                    const month = currentMonth.getMonth();
                    const year = currentMonth.getFullYear();
                    const firstDay = new Date(year, month, 1);
                    const lastDay = new Date(year, month + 1, 0);
                    const startDate = new Date(firstDay);
                    startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);
                    const calendarDays = [];
                    const currentDate = new Date(startDate);
                    while (currentDate <= lastDay || calendarDays.length < 42) {
                      const dateStr = currentDate.toISOString().split('T')[0];
                      const dayTasks = filteredTasks.filter(task => task.due === dateStr);
                      const isCurrentMonth = currentDate.getMonth() === month;
                      const isToday = dateStr === today.toISOString().split('T')[0];
                      calendarDays.push(
                        <div
                          key={dateStr}
                          className={`min-h-[120px] p-2 border border-gray-100 rounded-xl ${
                            isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                          } ${isToday ? 'ring-2 ring-blue-200' : ''}`}
                          onDragOver={e => e.preventDefault()}
                          onDrop={() => onCalendarDrop(dateStr)}
                        >
                          <div className={`text-sm font-semibold mb-2 ${
                            isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                          } ${isToday ? 'text-blue-600' : ''}`}>
                            {currentDate.getDate()}
                          </div>
                          <div className="space-y-1">
                            {dayTasks.slice(0, 3).map(task => (
                              <div
                                key={task.id}
                                className={`text-xs p-1 rounded cursor-pointer transition-colors truncate ${getPersonColor(task.assigned)} ${getPersonTextColor(task.assigned)} hover:brightness-110`}
                                onClick={() => handleTaskEdit(task.id)}
                                draggable
                                onDragStart={() => onDragStart(task.id)}
                                title={task.title}
                              >
                                <div className="font-semibold truncate">{task.title}</div>
                                <div className="text-xs opacity-80">{task.assigned}</div>
                              </div>
                            ))}
                            {dayTasks.length > 3 && (
                              <div className="text-xs text-gray-400 text-center">
                                +{dayTasks.length - 3} weitere
                              </div>
                            )}
                          </div>
                        </div>
                      );
                      currentDate.setDate(currentDate.getDate() + 1);
                    }
                    days = calendarDays;
                  } else {
                    // Wochenansicht
                    const weekStart = new Date(currentMonth);
                    weekStart.setDate(currentMonth.getDate() - ((currentMonth.getDay() + 6) % 7));
                    for (let i = 0; i < 7; i++) {
                      const d = new Date(weekStart);
                      d.setDate(weekStart.getDate() + i);
                      const dateStr = d.toISOString().split('T')[0];
                      const dayTasks = filteredTasks.filter(task => task.due === dateStr);
                      const isToday = dateStr === today.toISOString().split('T')[0];
                      days.push(
                        <div
                          key={dateStr}
                          className={`min-h-[320px] p-2 border border-gray-100 rounded-xl bg-white ${isToday ? 'ring-2 ring-blue-200' : ''}`}
                          onDragOver={e => e.preventDefault()}
                          onDrop={() => onCalendarDrop(dateStr)}
                        >
                          <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>{d.getDate()}</div>
                          <div className="space-y-1">
                            {dayTasks.map(task => (
                              <div
                                key={task.id}
                                className={`text-xs p-1 rounded cursor-pointer transition-colors truncate ${getPersonColor(task.assigned)} ${getPersonTextColor(task.assigned)} hover:brightness-110`}
                                onClick={() => handleTaskEdit(task.id)}
                                draggable
                                onDragStart={() => onDragStart(task.id)}
                                title={task.title}
                              >
                                <div className="font-semibold truncate">{task.title}</div>
                                <div className="text-xs opacity-80">{task.assigned}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  }
                  return days;
                })()}
              </div>
            </div>
          </section>
        )}
        {/* Bearbeitungsmodus Panel */}
        {editingTask && (
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-40 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Aufgabe bearbeiten</h3>
                <button
                  onClick={() => setEditingTask(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-xl hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              {(() => {
                const task = tasks.find(t => t.id === editingTask);
                if (!task) return null;
                
                return (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
                      <input
                        type="text"
                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200 focus:ring-2 focus:ring-blue-100 transition"
                        value={task.title}
                        onChange={e => updateTask(task.id, 'title', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priorität</label>
                      <select
                        className={`border-b border-gray-200 outline-none w-full font-semibold text-xs rounded px-2 py-1 ${getPriorityColor(task.priority)}`}
                        value={task.priority}
                        onChange={e => updateTask(task.id, 'priority', e.target.value)}
                    >
                      {priorities.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zugewiesen</label>
                      <select
                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200 focus:ring-2 focus:ring-blue-100 transition"
                        value={task.assigned}
                        onChange={e => updateTask(task.id, 'assigned', e.target.value)}
                      >
                        {users.map(u => <option key={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                      <input
                        type="date"
                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200 focus:ring-2 focus:ring-blue-100 transition"
                        value={task.due}
                        onChange={e => updateTask(task.id, 'due', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200 focus:ring-2 focus:ring-blue-100 transition"
                        value={task.status}
                        onChange={e => updateTask(task.id, 'status', e.target.value)}
                      >
                        <option value="todo">Todo</option>
                        <option value="inprogress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Drive-Link</label>
                    <input
                      type="url"
                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-gray-900 border border-gray-200 focus:ring-2 focus:ring-blue-100 transition"
                      value={task.drive}
                        onChange={e => updateTask(task.id, 'drive', e.target.value)}
                      placeholder="https://drive.google.com/..."
                    />
                    </div>
                    <div className="flex gap-3 pt-6">
                      <button
                        onClick={() => setEditingTask(null)}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                      >
                        Abbrechen
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Bist du sicher, dass du diese Aufgabe löschen möchtest?')) {
                            deleteTask(task.id);
                            setEditingTask(null);
                          }
                        }}
                        className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                      >
                        Löschen
                      </button>
                      <button
                        onClick={() => handleTaskSave(task.id)}
                        className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                      >
                        Speichern
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
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
"use client"

import type React from "react"

import { useState } from "react"
import { X, Calendar, Euro, FileText, Tag } from "lucide-react"

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (expense: any) => void
}

export function AddExpenseModal({ isOpen, onClose, onSave }: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    type: "einmalig", // einmalig, monatlich, jährlich
  })

  const categories = ["Fahrzeuge", "Büroausstattung", "Marketing", "Reisekosten", "Software", "Hardware", "Sonstiges"]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      amount: Number.parseFloat(formData.amount),
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    })
    setFormData({
      title: "",
      amount: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
      type: "einmalig",
    })
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 max-w-md w-full mx-4 border border-gray-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-foreground">Ausgabe hinzufügen</h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Beschreibung
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Ausgaben-Beschreibung"
                  className="w-full px-3 py-2 bg-input border border-gray-300 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Betrag (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-input border border-gray-300 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Kategorie
                </label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 bg-input border border-gray-300 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Kategorie wählen</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Typ
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 bg-input border border-gray-300 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="einmalig">Einmalig</option>
                  <option value="monatlich">Monatlich</option>
                  <option value="jährlich">Jährlich</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Datum
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 bg-input border border-gray-300 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Beschreibung (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Zusätzliche Details..."
                  rows={3}
                  className="w-full px-3 py-2 bg-input border border-gray-300 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-lg transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg transition-colors"
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

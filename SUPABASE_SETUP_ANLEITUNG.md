# 🚀 SUPABASE SETUP ANLEITUNG - SAN RISE DASHBOARD

## ✅ **PROBLEM BEHOBEN!**

Das Problem war, dass die Tabelle `employees` heißt, nicht `mitarbeiter`. 

## ✅ SCHRITT 1: Fehlende Tabellen erstellen

1. **Öffne dein Supabase Dashboard** (https://app.supabase.com/)
2. **Gehe zu deinem Projekt**
3. **Klicke auf "SQL Editor"** in der linken Sidebar
4. **Kopiere den gesamten Inhalt der `CREATE_TABLES_FINAL.sql` Datei**
5. **Füge ihn in den SQL Editor ein**
6. **Klicke auf "RUN"** um alle fehlenden Tabellen zu erstellen

## ✅ SCHRITT 2: Storage Setup (bereits erledigt)

Das Storage Setup mit `SUPABASE_STORAGE_SETUP_SIMPLIFIED.sql` hat bereits funktioniert! ✅

## ✅ SCHRITT 3: Verifikation

Nach dem Ausführen der SQL-Befehle solltest du folgende Tabellen haben:

### 📊 **Tabellen:**
- ✅ `employees` - Mitarbeiterdaten (bereits vorhanden, wird aktualisiert)
- ✅ `vertragskosten` - Vertragsdaten (bereits vorhanden, wird aktualisiert)
- ✅ `settings` - Einstellungen (NEU - mit SAN RISE GMBH als Standard)
- ✅ `additional_costs` - Zusätzliche Kosten (NEU)
- ✅ `events` - Events (bereits vorhanden)
- ✅ `tasks` - Aufgaben (bereits vorhanden)

### 🗂️ **Storage Buckets:** (bereits erstellt)
- ✅ `employee-files` - Mitarbeiterdateien
- ✅ `contract-files` - Vertragsdateien
- ✅ `additional-costs` - Zusätzliche Kosten Dateien
- ✅ `event-files` - Event-Dateien
- ✅ `task-files` - Aufgaben-Dateien

## ✅ SCHRITT 4: Testen

1. **Dein Dashboard läuft bereits**: http://localhost:3000
2. **Teste folgende Funktionen:**
   - ✅ Settings-Seite öffnen (sollte "SAN RISE GMBH" als Standard zeigen)
   - ✅ Zusätzliche Kosten hinzufügen (Dashboard + Kostenverwaltung)
   - ✅ Event bearbeiten (sollte nicht mehr neue Events erstellen)
   - ✅ File Upload in allen Bereichen

## 🔧 WICHTIGE HINWEISE:

1. **CREATE_TABLES_FINAL.sql** - Korrigierte Version für `employees` Tabelle
2. **Storage Setup bereits erledigt** - `SUPABASE_STORAGE_SETUP_SIMPLIFIED.sql` hat funktioniert
3. **Settings Standard**: "SAN RISE GMBH" wird automatisch eingefügt
4. **CORPORATE Kosten**: Synchronisieren sich automatisch mit aktiven Mitarbeiterkosten
5. **File Uploads**: Funktionieren mit allen Dateitypen (PDF, DOC, DOCX, JPG, JPEG, PNG)

## 🚨 FEHLERBEHEBUNG:

### ❌ **"relation mitarbeiter does not exist"** 
→ **GELÖST**: Verwende `CREATE_TABLES_FINAL.sql` - verwendet korrekte `employees` Tabelle

### ✅ **Storage Setup** 
→ **BEREITS ERLEDIGT**: `SUPABASE_STORAGE_SETUP_SIMPLIFIED.sql` hat funktioniert

## 📝 NACH DEM SETUP:

Alle Funktionen sollten jetzt funktionieren:
- ✅ Settings mit SAN RISE GMBH Standard
- ✅ Automatische CORPORATE-Kosten Synchronisation (aktuell: 2684€ für Nik)
- ✅ Event-Bearbeitung (keine neuen Events mehr)
- ✅ Zusätzliche Kosten hinzufügen
- ✅ File Upload in allen Bereichen
- ✅ Bereit für Vercel Deployment

## 🎯 **SCHNELLTEST:**

Nach dem SQL-Setup sollte folgendes funktionieren:
```bash
# Settings API sollte SAN RISE GMBH zurückgeben
curl http://localhost:3000/api/settings

# Additional Costs API sollte leeres Array zurückgeben
curl http://localhost:3000/api/additional-costs
```

**Beide APIs sollten nicht mehr `null` oder Fehler zurückgeben!**

## 🚀 **NÄCHSTER SCHRITT:**

Führe nur noch die `CREATE_TABLES_FINAL.sql` aus und alle Funktionen sollten funktionieren! 
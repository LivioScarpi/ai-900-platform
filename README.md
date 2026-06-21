# AI-900 Study Platform

Una web app per prepararsi alla certificazione **Microsoft Azure AI Fundamentals (AI-900)**, costruita come progetto personale di studio e come case study per un corso di **vibe coding orientato al design**.

> Progetto sviluppato in collaborazione con Claude Code, partendo da specifiche scritte a mano (vedi [`specs.md`](./specs.md)) e iterando su UI/UX, dati e funzionalità.

---

## 🎯 Obiettivo del progetto

1. **Studio personale** — esercitarsi sulle ~570 domande dell'esame AI-900 con diverse modalità (sequenziale, casuale, per topic, simulazione esame, flashcard).
2. **Caso studio "vibe coding"** — mostrare un workflow realistico in cui un designer/developer collabora con un agente AI (Claude Code) per: definire specifiche, progettare l'architettura dati, costruire UI component-based, iterare sul design, e gestire un workflow di estrazione dati semi-automatico (OCR + AI vision).

---

## ✨ Funzionalità principali

- **Modalità di studio multiple**
  - Sequenziale — tutte le domande in ordine
  - Casuale — tutte le domande mescolate
  - Per topic — focus su un argomento specifico
  - Solo domande Microsoft (ufficiali)
  - Modalità esame — 50 domande casuali, 45 minuti, con punteggio finale
  - Flashcard — ripasso rapido
- **Card interattive per ogni tipo di domanda**
  - Scelta multipla (singola/multipla)
  - Drag & drop
  - Dropdown / completamento frase
  - Tabelle Sì/No
  - Immagini di contesto (diagrammi, screenshot, grafici)
- **Spiegazioni dettagliate** per ogni risposta, con riferimenti e immagini
- **Dashboard statistiche** — tracking dei tentativi e performance per argomento
- **Autenticazione** e persistenza dei progressi via Supabase
- **Architettura multi-certificazione** — pensata per essere estesa ad altre certificazioni oltre AI-900

---

## 🏗️ Stack tecnico

| Layer | Tecnologia |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) + TypeScript |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Backend / Auth / DB | [Supabase](https://supabase.com/) (free tier) |
| Drag & Drop | [dnd-kit](https://dndkit.com/) |
| Grafici | [Recharts](https://recharts.org/) |
| Hosting | [Vercel](https://vercel.com/) |
| Estrazione dati domande | Script Node + Claude Vision API (one-time, offline) |

---

## 🧠 Architettura dei dati: contenuti generati offline, app statica

Il punto più interessante del progetto dal punto di vista "vibe coding" è come vengono aggiunte nuove domande.

### Aggiunta domande — skill Claude Code

Le nuove domande **non** vengono inserite a mano né tramite uno script di preprocessing eseguito una volta: si usa una **skill di Claude Code** dedicata ([`.claude/skills/add-questions`](./.claude/skills/add-questions/SKILL.md)), invocata su una cartella di screenshot del quiz. La skill:
1. fa OCR delle immagini (tool Swift basati su Vision framework, macOS)
2. rileva la risposta corretta cercando l'evidenziazione verde
3. classifica il tipo di domanda (MCQ, sì/no, drag&drop, ecc. — vedi [references/question-types.md](./.claude/skills/add-questions/references/question-types.md))
4. controlla duplicati/conflitti rispetto alle domande esistenti
5. aggiunge le nuove domande a `data/questions.json` e produce un report

Il workflow completo è documentato in [`docs/add-questions-from-images.md`](./docs/add-questions-from-images.md).

### App (runtime)

L'app Next.js legge esclusivamente `data/certifications/ai900/questions.json` (build/runtime), senza alcuna chiamata AI a runtime: veloce, statica, deployabile facilmente su Vercel.

```
data/
└── certifications/
    └── ai900/
        ├── questions.json   ← ~495 domande "video" + 75 "Microsoft"
        └── config.json      ← configurazione della certificazione
```

Per i dettagli completi sul formato delle domande e sui tipi di card, vedi [`specs.md`](./specs.md).

---

## 📂 Struttura del progetto

```
src/
├── app/
│   ├── [certId]/             # routing dinamico per certificazione (es. /ai900)
│   │   ├── dashboard/
│   │   ├── exam/
│   │   └── study/
│   │       ├── microsoft/
│   │       ├── random/
│   │       ├── sequential/
│   │       └── topic/[topicId]/
│   ├── login/
│   └── flashcards/
├── components/
│   ├── questions/            # una card per ogni tipo di domanda
│   │   ├── McqCard.tsx
│   │   ├── MultiCard.tsx
│   │   ├── YesNoCard.tsx
│   │   ├── DragDropCard.tsx
│   │   ├── DropdownCard.tsx
│   │   └── SentenceCompletionCard.tsx
│   ├── QuestionCard.tsx
│   ├── ExplanationDrawer.tsx
│   ├── ProgressBar.tsx
│   ├── Sidebar.tsx
│   └── Timer.tsx
├── hooks/
└── lib/
    ├── questions.ts          # caricamento e filtro domande
    ├── certifications.ts     # registro certificazioni
    └── topics.ts
```

---

## 🚀 Avvio locale

```bash
npm install
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

### Variabili d'ambiente

L'app usa Supabase per autenticazione e statistiche. Crea un file `.env.local` con:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Lo schema del database è in [`supabase/schema.sql`](./supabase/schema.sql).

---

## 🎓 Come è stato costruito (per il corso di vibe coding)

Punti utili per chi segue il progetto come case study:

1. **Specifiche prima del codice** — [`specs.md`](./specs.md) descrive l'architettura dati, i tipi di domanda e il formato JSON *prima* di scrivere una riga di UI.
2. **Component design system "a card"** — ogni tipo di domanda (MCQ, drag&drop, sì/no, dropdown...) ha un componente dedicato con un'interfaccia comune (`CardShell`), facile da estendere.
3. **Routing scalabile** — `[certId]` permette di aggiungere nuove certificazioni senza riscrivere le pagine.
4. **Skill personalizzata come pipeline dati** — invece di uno script offline, una skill di Claude Code (OCR + rilevamento colore + ragionamento) trasforma screenshot del quiz in domande strutturate, gestendo anche duplicati e conflitti.
5. **Iterazione di design incrementale** — UI, layout di studio e dashboard sono stati rifiniti in più passaggi successivi con un agente AI, partendo da una base funzionante e migliorando UX, responsività e coerenza visiva.

---

## 📌 Stato del progetto

Progetto in evoluzione, usato attivamente per lo studio personale. Possibili sviluppi futuri:
- Layout di studio condiviso tra le pagine `study/*` (refactoring in corso)
- Estensione ad altre certificazioni Microsoft oltre AI-900
- Miglioramenti alla dashboard statistiche

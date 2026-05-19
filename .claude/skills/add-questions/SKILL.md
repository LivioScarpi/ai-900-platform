---
name: add-questions
description: Aggiungi domande da immagini PNG a data/questions.json usando OCR e rilevamento del testo verde. Usa quando vuoi estrarre domande da screenshot di quiz AI-900.
disable-model-invocation: true
argument-hint: <cartella-immagini>
allowed-tools: Bash Read
compatibility: macOS only (requires Swift/Vision framework and AppKit)
metadata:
  author: ai-900-platform
  version: "2.0"
---

Aggiungi le domande dalla cartella `$ARGUMENTS` a `data/questions.json`.

Per i formati domanda supportati e i topic disponibili, vedi [references/question-types.md](references/question-types.md).

## Step 1 — Compila i tool Swift (se non esistono)

```bash
[ -f /tmp/ocr_with_bounds ] || swiftc "${CLAUDE_SKILL_DIR}/scripts/ocr_with_bounds.swift" -o /tmp/ocr_with_bounds
[ -f /tmp/find_green ] || swiftc "${CLAUDE_SKILL_DIR}/scripts/find_green.swift" -o /tmp/find_green
```

## Step 2 — Controlla l'ultimo ID

```python
import json
with open('data/questions.json') as f:
    data = json.load(f)
last_id = data['video'][-1]['id']
print(f"Last video ID: {last_id}, next starts at {last_id + 1}")
```

## Step 3 — OCR e green detection su ogni immagine

```bash
for img in "$ARGUMENTS"/*.png; do
  echo "=== $(basename "$img") ==="
  /tmp/ocr_with_bounds "$img"
  echo "--- GREEN ---"
  /tmp/find_green "$img"
  echo ""
done
```

## Step 4 — Analizza i risultati

Per ogni immagine:
- **Domanda**: blocchi OCR nella parte alta (0–30%)
- **Opzioni**: blocchi OCR con lettere A/B/C/D (30–75%)
- **Risposta corretta**: confronta la Y% del verde con la Y% delle opzioni — l'opzione più vicina è corretta

**Casi speciali:**
- `yesno` senza verde → usa `Read` per vedere l'immagine e trovare il radio button blu selezionato
- Domanda con tabella/grafico → salva come `contextImage` (vedi [references/question-types.md](references/question-types.md))
- URL in fondo all'immagine (80–100%) → ignorare

## Step 5 — Verifica duplicati

```python
import json
with open('data/questions.json') as f:
    data = json.load(f)
all_q = data['video'] + data.get('microsoft', [])

keyword = "keyword da cercare"
matches = [q for q in all_q if keyword.lower() in q['text'].lower()]
for m in matches:
    print(f"ID {m['id']}: {m['text'][:100]}")
    print(f"  Options: {m.get('options', [])}")
    print(f"  Answer: {m.get('correctAnswer', m.get('correctAnswers', ''))}")
```

Regole:
- Stesso testo + stesse opzioni + stessa risposta → duplicato, scarta silenziosamente
- Stesso testo + stesse opzioni + risposta **diversa** → **conflitto**: NON aggiungere, segnala con giudizio motivato
- Stesso testo + opzioni diverse → non è duplicato, includi
- In caso di dubbio → includi

## Step 6 — Aggiungi le domande

```python
import json

with open('data/questions.json') as f:
    data = json.load(f)

new_questions = [
    # lista costruita dall'analisi
]

data['video'].extend(new_questions)

with open('data/questions.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Video questions: {len(data['video'])}, Last ID: {data['video'][-1]['id']}")
```

## Step 7 — Report finale

Mostra:
- Tabella con ID, testo breve e risposta corretta per ogni domanda aggiunta
- Duplicati scartati (con ID esistente)
- **Conflitti da risolvere**: ID esistente, risposta attuale vs rilevata, giudizio tecnico motivato
- Nuovo totale e prossimo ID disponibile

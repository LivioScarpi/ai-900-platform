# Formati domanda e topic — AI-900 questions.json

## Tipi di domanda

### `mcq` — Scelta singola
```json
{
  "id": 133,
  "topic": "ml_fundamentals",
  "type": "mcq",
  "text": "Testo della domanda",
  "options": [
    {"letter": "A", "text": "Opzione A"},
    {"letter": "B", "text": "Opzione B"}
  ],
  "correctAnswer": "A",
  "explanation": "Spiegazione della risposta corretta.",
  "contextImages": []
}
```

### `multi` — Scelta multipla
```json
{
  "id": 134,
  "topic": "responsible_ai",
  "type": "multi",
  "text": "Testo della domanda. Select all that apply.",
  "options": [
    {"letter": "A", "text": "Opzione A"},
    {"letter": "B", "text": "Opzione B"}
  ],
  "correctAnswers": ["A", "B"],
  "explanation": "Spiegazione.",
  "contextImages": []
}
```

### `yesno` — Sì/No per più affermazioni
```json
{
  "id": 135,
  "topic": "ml_fundamentals",
  "type": "yesno",
  "text": "For each statement, select Yes or No.",
  "statements": [
    {"text": "Affermazione 1", "correct": "Yes"},
    {"text": "Affermazione 2", "correct": "No"}
  ],
  "explanation": "Spiegazione.",
  "contextImages": []
}
```

Le domande `yesno` usano **radio button blu** per la risposta corretta, non testo verde. `find_green` restituisce `No green text found`. Usa il tool `Read` per vedere l'immagine visivamente.

### `dragdrop` — Abbinamento drag & drop
```json
{
  "id": 136,
  "topic": "ml_fundamentals",
  "type": "dragdrop",
  "text": "Match the items to the descriptions.",
  "items": ["Item A", "Item B", "Item C"],
  "targets": [
    {"text": "Descrizione 1", "correctItem": "Item A"},
    {"text": "Descrizione 2", "correctItem": "Item B"}
  ],
  "explanation": "Spiegazione.",
  "contextImages": []
}
```

### `sentence_completion` — Completamento frase
```json
{
  "id": 137,
  "topic": "responsible_ai",
  "type": "sentence_completion",
  "text": "To complete the sentence, select the appropriate option.",
  "sentence": "The [BLANK] principle ensures fairness.",
  "options": ["accountability", "fairness", "transparency"],
  "correctAnswer": "fairness",
  "explanation": "Spiegazione.",
  "contextImages": []
}
```

### `dropdown` — Dropdown per più parti
```json
{
  "id": 138,
  "topic": "ml_fundamentals",
  "type": "dropdown",
  "text": "Use the drop-down menus to complete each statement.",
  "statements": [
    {
      "text": "Household Income is [answer choice].",
      "options": ["A feature", "A label"],
      "correctAnswer": "A feature"
    }
  ],
  "explanation": "Spiegazione.",
  "contextImages": []
}
```

---

## Topic disponibili

| Topic | Descrizione |
|-------|-------------|
| `ml_fundamentals` | Fondamenti ML (regressione, classificazione, clustering, feature, label…) |
| `responsible_ai` | Principi Microsoft Responsible AI |
| `azure_ml` | Azure Machine Learning (AutoML, Designer, pipeline…) |
| `azure_cognitive` | Azure Cognitive Services (Form Recognizer, Custom Vision…) |
| `computer_vision` | Computer Vision (OCR, object detection, facial recognition…) |
| `nlp` | Natural Language Processing |
| `conversational_ai` | Bot, Azure Bot Service, canali |
| `unknown` | Argomento non classificabile |

---

## Immagini di contesto

Se la domanda contiene un grafico, tabella o diagramma che fa parte del testo:

```bash
UUID=$(python3 -c "import uuid; print(uuid.uuid4())")
cp "<percorso immagine originale>" "data/images/${UUID}.png"
cp "<percorso immagine originale>" "public/images/${UUID}.png"
echo $UUID
```

Includi `"contextImages": ["<UUID>.png"]` nella domanda. Se non ci sono elementi visivi rilevanti, usa `[]`.

Per ritagliare con `sips` (macOS):
```bash
# sips -c <altezza> <larghezza> <sorgente> --cropOffset <offsetY> <offsetX> --out <destinazione>
sips -c 490 2728 /tmp/orig.png --cropOffset 250 0 --out data/images/nome.png
cp data/images/nome.png public/images/nome.png
```

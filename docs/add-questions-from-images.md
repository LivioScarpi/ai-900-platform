# Come aggiungere domande da immagini a questions.json

## Contesto

Il file `data/questions.json` contiene le domande per la piattaforma AI-900.
Ogni domanda ha un `id` progressivo (da verificare sempre l'ultimo presente nel file prima di aggiungerne di nuove).

---

## Processo step-by-step

### 1. Controllare l'ultimo ID presente

```python
import json
with open('data/questions.json') as f:
    questions = json.load(f)
print(f'Total: {len(questions)}, Last ID: {questions[-1]["id"]}')
```

Le nuove domande partono da `lastId + 1`.

---

### 2. OCR delle immagini con Swift (macOS Vision)

Compilare questo tool una volta sola:

```bash
cat > /tmp/ocr_with_bounds.swift << 'EOF'
import Vision
import Foundation

let args = CommandLine.arguments
guard args.count > 1 else { exit(1) }

let imageURL = URL(fileURLWithPath: args[1])
let requestHandler = VNImageRequestHandler(url: imageURL, options: [:])
let request = VNRecognizeTextRequest { (request, error) in
    guard let observations = request.results as? [VNRecognizedTextObservation] else { return }
    for obs in observations {
        if let top = obs.topCandidates(1).first {
            let y = obs.boundingBox.origin.y
            let pct = Int((1.0 - y) * 100)
            print("[\(pct)%] \(top.string)")
        }
    }
}
request.recognitionLevel = .accurate
try! requestHandler.perform([request])
EOF
swiftc /tmp/ocr_with_bounds.swift -o /tmp/ocr_with_bounds
```

Usare il tool su ogni immagine:

```bash
/tmp/ocr_with_bounds "/path/to/image.png"
```

L'output mostra ogni riga di testo con la sua posizione verticale in percentuale (dall'alto verso il basso).

---

### 3. Identificare le risposte corrette (testo verde)

Compilare questo tool una volta sola:

```bash
cat > /tmp/find_green.swift << 'EOF'
import AppKit
import Foundation

let args = CommandLine.arguments
guard args.count > 1 else { exit(1) }

let imagePath = args[1]
guard let image = NSImage(contentsOfFile: imagePath),
      let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else { exit(1) }

let width = cgImage.width
let height = cgImage.height

guard let data = cgImage.dataProvider?.data,
      let bytes = CFDataGetBytePtr(data) else { exit(1) }

let bytesPerPixel = cgImage.bitsPerPixel / 8
var greenRows: Set<Int> = []

for y in 0..<height {
    for x in 0..<width {
        let offset = (y * width + x) * bytesPerPixel
        let r = Int(bytes[offset])
        let g = Int(bytes[offset + 1])
        let b = Int(bytes[offset + 2])
        if g > 120 && r < 100 && b < 100 {
            greenRows.insert(y)
        }
    }
}

let sortedRows = greenRows.sorted()
if sortedRows.isEmpty {
    print("No green text found")
} else {
    var groups: [[Int]] = []
    var current: [Int] = [sortedRows[0]]
    for i in 1..<sortedRows.count {
        if sortedRows[i] - sortedRows[i-1] < 5 { current.append(sortedRows[i]) }
        else { groups.append(current); current = [sortedRows[i]] }
    }
    groups.append(current)
    print("Image size: \(width)x\(height)")
    print("Green text at Y positions:")
    for group in groups {
        let midY = group[group.count/2]
        let pct = Int(Double(midY) / Double(height) * 100)
        print("  Y~\(midY) (\(pct)% from top)")
    }
}
EOF
swiftc /tmp/find_green.swift -o /tmp/find_green
```

Usare il tool:

```bash
/tmp/find_green "/path/to/image.png"
```

**Come interpretare il risultato:** confrontare la percentuale Y del verde con la percentuale Y delle opzioni estratte dall'OCR. L'opzione più vicina è la risposta corretta.

---

### 4. Struttura delle domande nel JSON

Il file supporta diversi tipi di domanda. Ecco i principali:

#### `mcq` — Scelta singola
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

#### `multi` — Scelta multipla
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

#### `yesno` — Sì/No per più affermazioni
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

#### `dragdrop` — Abbinamento drag & drop
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

#### `sentence_completion` — Completamento frase
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

#### `dropdown` — Dropdown per più parti
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

### 5. Topic disponibili

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

### 6. Aggiungere un'immagine di contesto alla domanda

Se la domanda ha un grafico o diagramma da mostrare prima delle opzioni:

1. **Ritagliare** l'immagine con `sips` (macOS):
```bash
# sips -c <altezza> <larghezza> <sorgente> --cropOffset <offsetY> <offsetX> --out <destinazione>
sips -c 490 2728 /tmp/orig.png --cropOffset 250 0 --out data/images/nome-immagine.png
```

2. **Copiare l'immagine anche in `public/images/`** (obbligatorio per renderla visibile nell'app):
```bash
cp data/images/nome-immagine.png public/images/nome-immagine.png
```

3. **Riferirla nel JSON** nella proprietà `contextImages`:
```json
"contextImages": ["nome-immagine.png"]
```

Le immagini vanno salvate **sia in `data/images/`** (archivio sorgente) **che in `public/images/`** (servite dall'app). Il nome è libero ma deve essere descrittivo (es. `nlp-flow-diagram-q135.png`).

---

### 7. Verificare duplicati prima di aggiungere

Prima di aggiungere una domanda, verificare se esiste già nel file con testo simile. Le domande duplicate vanno **scartate** e segnalate.

Criteri di duplicato:
- Stesso testo della domanda (anche con leggere variazioni di punteggiatura)
- Stesse opzioni e stessa risposta corretta
- Stesso scenario (es. stessa domanda sul principio Responsible AI con le stesse opzioni)

---

### 8. Aggiungere le domande al file

```python
import json

with open('data/questions.json') as f:
    questions = json.load(f)

new_questions = [
    # ... lista di nuove domande
]

questions.extend(new_questions)

with open('data/questions.json', 'w') as f:
    json.dump(questions, f, indent=2, ensure_ascii=False)

print(f"Totale domande: {len(questions)}, Ultimo ID: {questions[-1]['id']}")
```

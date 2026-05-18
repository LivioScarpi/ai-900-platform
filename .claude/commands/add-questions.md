# add-questions

Aggiungi domande da immagini a `data/questions.json`.

## Input

`$ARGUMENTS` è il percorso della cartella contenente le immagini PNG (relativo alla root del progetto).  
Esempio: `data/ai-900-video-questions/tech_with_jaspal/1`

## Processo

### 1. Verifica e compilazione tool Swift

Controlla se `/tmp/ocr_with_bounds` e `/tmp/find_green` esistono già. Se non esistono, compilali:

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

### 2. Controlla l'ultimo ID

```python
import json
with open('data/questions.json') as f:
    data = json.load(f)
last_id = data['video'][-1]['id']
print(f"Last video ID: {last_id}, next starts at {last_id + 1}")
```

### 3. Esegui OCR e green detection su ogni immagine

Per ogni file PNG nella cartella `$ARGUMENTS` (ordine alfabetico):

```bash
for img in "$ARGUMENTS"/*.png; do
  echo "=== $(basename "$img") ==="
  /tmp/ocr_with_bounds "$img"
  echo "--- GREEN ---"
  /tmp/find_green "$img"
  echo ""
done
```

### 4. Analisi dei risultati

Per ogni immagine, determina:
- **Testo della domanda** dai blocchi OCR nella parte alta (solitamente 0–30%)
- **Opzioni** dai blocchi OCR con lettere A/B/C/D (solitamente 30–75%)
- **Risposta corretta** confrontando la Y% del verde con la Y% delle opzioni: l'opzione più vicina è corretta

**Attenzione domande `yesno`:** se `find_green` restituisce `No green text found`, la domanda usa radio button blu. Usa il tool `Read` per vedere l'immagine e determinare visivamente quale opzione è selezionata.

**Attenzione a immagini con testo misto:** alcune immagini hanno sia testo della domanda che un URL di riferimento in fondo (80–100%) — ignorare l'URL.

**Immagini di contesto:** se la domanda contiene una tabella, un grafico, o qualsiasi elemento visivo che fa parte del testo della domanda (e non è solo decorativo), quella PNG va salvata come `contextImage`. Fallo subito dopo aver identificato la domanda, prima di costruire il JSON:

```bash
UUID=$(python3 -c "import uuid; print(uuid.uuid4())")
cp "<percorso immagine originale>" "data/images/${UUID}.png"
cp "<percorso immagine originale>" "public/images/${UUID}.png"
echo $UUID
```

Poi includi il campo `"contextImages": ["<UUID>.png"]` nella domanda. Se la domanda non ha elementi visivi rilevanti (solo testo e opzioni), ometti il campo o usa `[]`.

### 5. Verifica duplicati

Prima di aggiungere ogni domanda, cerca nel JSON esistente:

```python
import json
with open('data/questions.json') as f:
    data = json.load(f)
all_q = data['video'] + data.get('microsoft', [])

# Cerca per keyword chiave del testo della domanda
keyword = "keyword da cercare"
matches = [q for q in all_q if keyword.lower() in q['text'].lower()]
for m in matches:
    print(f"ID {m['id']}: {m['text'][:100]}")
    print(f"  Options: {m.get('options', [])}")
    print(f"  Answer: {m.get('correctAnswer', m.get('correctAnswers', ''))}")
```

Una domanda è duplicata se ha stesso testo e stesse opzioni (indipendentemente dall'ordine delle lettere). Applica questa logica:

- **Stesso testo + stesse opzioni + stessa risposta corretta** → duplicato, scarta silenziosamente.
- **Stesso testo + stesse opzioni + risposta corretta DIVERSA** → **conflitto di risposta**: NON scartare, NON aggiungere. Segnala all'utente con:
  - ID della domanda esistente
  - Risposta esistente nel JSON
  - Risposta rilevata dall'immagine (verde)
  - Il tuo giudizio motivato su quale delle due sia corretta, con spiegazione tecnica
- **Stesso testo + opzioni diverse** → non è un duplicato, includi la domanda.
- **In caso di dubbio** → includi la domanda.

### 6. Costruisci e aggiungi le domande

Formato delle domande (vedi `docs/add-questions-from-images.md` per tutti i tipi: `mcq`, `multi`, `yesno`, `dragdrop`, `sentence_completion`, `dropdown`).

**Topic disponibili:** `ml_fundamentals`, `responsible_ai`, `azure_ml`, `azure_cognitive`, `computer_vision`, `nlp`, `conversational_ai`, `unknown`

```python
import json

with open('data/questions.json') as f:
    data = json.load(f)

new_questions = [
    # lista domande costruita dall'analisi
]

data['video'].extend(new_questions)

with open('data/questions.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Video questions: {len(data['video'])}, Last ID: {data['video'][-1]['id']}")
```

### 7. Report finale

Mostra all'utente:
- Tabella con ID, testo breve e risposta corretta per ogni domanda aggiunta
- Lista delle domande scartate (duplicati esatti) con l'ID del duplicato esistente
- **Sezione "Conflitti da risolvere"** per ogni domanda con risposta discordante: mostra ID esistente, risposta attuale, risposta rilevata dall'immagine, e il tuo giudizio motivato su quale sia corretta
- Nuovo totale e prossimo ID disponibile

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

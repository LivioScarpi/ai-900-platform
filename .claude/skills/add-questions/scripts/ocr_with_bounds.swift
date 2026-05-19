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

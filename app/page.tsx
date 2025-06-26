"use client";

import { useState } from "react";
import PdfViewer from "./components/PdfViewer";

interface CoordinateData {
  page: number;
  page_width: number;
  page_height: number;
  words: Array<{
    text: string;
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    width: number;
    height: number;
  }>;
  characters: Array<{
    text: string;
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    fontname: string;
    size: number;
  }>;
}

export default function Home() {
  const [extractedText, setExtractedText] = useState<string>("");
  const [coordinates, setCoordinates] = useState<CoordinateData[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string>("");
  const [showCoordinates, setShowCoordinates] = useState(false);

  const extractTextFromPDF = async () => {
    setIsExtracting(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5001/extract-pdf-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: "/simpleTestPDF.pdf" }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success) {
        setExtractedText(
          data.text || `No text found in PDF (${data.pages} pages detected)`
        );
        setCoordinates(data.coordinates || []);
      } else {
        setError(data.error || "Failed to extract text");
      }
    } catch (_err) {
      setError(
        "Failed to connect to PDF extraction service. Make sure the Python API is running on port 5001."
      );
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <main className="h-screen grid grid-cols-2 gap-2 p-4">
      <div className="border border-gray-300 rounded-md p-2 overflow-auto">
        {/* PDF viewer */}
        {/* Loading react-pdf-viewer dynamically ensures it only runs on the client */}
        <PdfViewer src="/simpleTestPDF.pdf" />
      </div>

      <div className="border border-gray-300 rounded-md p-2 overflow-auto">
        <div className="mb-4 space-y-2">
          <button
            onClick={extractTextFromPDF}
            disabled={isExtracting}
            className={`px-4 py-2 rounded-md text-white font-medium ${
              isExtracting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isExtracting ? "Extracting..." : "Extract Text with pdfplumber"}
          </button>

          {coordinates.length > 0 && (
            <button
              onClick={() => setShowCoordinates(!showCoordinates)}
              className="ml-2 px-4 py-2 rounded-md text-white font-medium bg-green-500 hover:bg-green-600"
            >
              {showCoordinates ? "Hide Coordinates" : "Show Coordinates"}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="whitespace-pre-wrap text-sm">
          {extractedText || (
            <p className="text-center text-gray-500">
              Click "Extract Text with pdfplumber" to extract text from the PDF
            </p>
          )}
        </div>

        {showCoordinates && coordinates.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Text Coordinates</h3>

            {coordinates.map((pageData, pageIndex) => (
              <div key={pageIndex} className="mb-6">
                <h4 className="font-medium text-md mb-2">
                  Page {pageData.page} ({pageData.page_width}x
                  {pageData.page_height})
                </h4>

                <div className="mb-4">
                  <h5 className="font-medium text-sm mb-2">
                    Words ({pageData.words.length})
                  </h5>
                  <div className="max-h-40 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                    {pageData.words.slice(0, 20).map((word, wordIndex) => (
                      <div key={wordIndex} className="mb-1">
                        <span className="font-mono bg-blue-100 px-1 rounded">
                          "{word.text}"
                        </span>
                        <span className="text-gray-600 ml-2">
                          x: {word.x0.toFixed(1)}-{word.x1.toFixed(1)}, y:{" "}
                          {word.y0.toFixed(1)}-{word.y1.toFixed(1)}(
                          {word.width.toFixed(1)}×{word.height.toFixed(1)})
                        </span>
                      </div>
                    ))}
                    {pageData.words.length > 20 && (
                      <div className="text-gray-500 italic">
                        ... and {pageData.words.length - 20} more words
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h5 className="font-medium text-sm mb-2">
                    Characters (first 20)
                  </h5>
                  <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded text-xs">
                    {pageData.characters.slice(0, 20).map((char, charIndex) => (
                      <div key={charIndex} className="mb-1">
                        <span className="font-mono bg-yellow-100 px-1 rounded">
                          "{char.text}"
                        </span>
                        <span className="text-gray-600 ml-2">
                          x: {char.x0.toFixed(1)}-{char.x1.toFixed(1)}, y:{" "}
                          {char.y0.toFixed(1)}-{char.y1.toFixed(1)}, font:{" "}
                          {char.fontname}, size: {char.size}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

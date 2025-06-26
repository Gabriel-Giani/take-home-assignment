"use client";

import { useState } from "react";
import PdfViewer from "./components/PdfViewer";

export default function Home() {
  const [extractedText, setExtractedText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string>("");

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
        <div className="mb-4">
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
      </div>
    </main>
  );
}

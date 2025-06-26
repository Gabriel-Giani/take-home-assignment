"use client";

import { useState } from "react";
import PdfViewer from "./components/PdfViewer";
import ExtractedTextViewer from "./components/ExtractedTextViewer";
import FileUpload from "./components/FileUpload";
import { useDocumentIntelligence } from "./hooks/useDocumentIntelligence";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("/tickets.pdf"); // Default PDF

  // You'll need to set these from environment variables or user input
  const [azureConfig] = useState({
    endpoint:
      process.env.NEXT_PUBLIC_AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT || "",
    apiKey: process.env.NEXT_PUBLIC_AZURE_DOCUMENT_INTELLIGENCE_API_KEY || "",
  });

  const { analyzeDocument, isAnalyzing, result, error, clearResult } =
    useDocumentIntelligence(azureConfig);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    // Create a URL for the PDF viewer
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    // Clear previous results
    clearResult();
  };

  const handleAnalyzePdf = async () => {
    if (!selectedFile) {
      alert("Please select a PDF file first");
      return;
    }

    try {
      await analyzeDocument(selectedFile);
    } catch (err) {
      console.error("Failed to analyze PDF:", err);
      // The error is already handled by the hook, but we can add additional logging here
    }
  };

  const configurationMissing = !azureConfig.endpoint || !azureConfig.apiKey;

  return (
    <main className="h-screen flex flex-col">
      {/* Header with controls */}
      <div className="border-b border-gray-300 p-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">PDF Document Intelligence</h1>
        <div className="flex items-center gap-4">
          {configurationMissing && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded">
              ⚠️ Azure Document Intelligence not configured
            </div>
          )}
          <button
            onClick={handleAnalyzePdf}
            disabled={isAnalyzing || configurationMissing || !selectedFile}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze PDF"}
          </button>
          {result && (
            <button
              onClick={clearResult}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Results
            </button>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Configuration help */}
      {configurationMissing && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 mx-4 mt-4 rounded">
          <strong>Configuration Required:</strong> Please set the following
          environment variables:
          <ul className="mt-2 ml-4 list-disc text-sm">
            <li>
              <code>NEXT_PUBLIC_AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT</code>
            </li>
            <li>
              <code>NEXT_PUBLIC_AZURE_DOCUMENT_INTELLIGENCE_API_KEY</code>
            </li>
          </ul>
          <p className="mt-2 text-sm">
            You can create a Document Intelligence resource in the Azure portal
            and copy the endpoint and key.
          </p>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 grid grid-cols-2 gap-2 p-4">
        <div className="border border-gray-300 rounded-md p-2 overflow-auto">
          <h2 className="text-lg font-medium mb-4 text-gray-700">
            PDF Document
          </h2>

          {!selectedFile ? (
            <div className="space-y-4">
              <FileUpload
                onFileSelect={handleFileSelect}
                isAnalyzing={isAnalyzing}
                disabled={configurationMissing}
              />

              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">or</div>
                <button
                  onClick={() => {
                    // Convert the default PDF to a File object for analysis
                    fetch("/tickets.pdf")
                      .then((res) => res.blob())
                      .then((blob) => {
                        const file = new File([blob], "tickets.pdf", {
                          type: "application/pdf",
                        });
                        handleFileSelect(file);
                      })
                      .catch((err) =>
                        console.error("Failed to load default PDF:", err)
                      );
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Use sample PDF (tickets.pdf)
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <div>
                  <p className="font-medium text-gray-700">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPdfUrl("/tickets.pdf");
                    clearResult();
                  }}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
              <PdfViewer src={pdfUrl} />
            </div>
          )}
        </div>

        <div className="border border-gray-300 rounded-md p-2 overflow-auto">
          <ExtractedTextViewer
            extractedTexts={result?.extractedTexts || []}
            isLoading={isAnalyzing}
          />
        </div>
      </div>
    </main>
  );
}

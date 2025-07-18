"use client";

// React
import { useState } from "react";

// Components
import PdfViewer from "./components/PdfViewer";
import FileUpload from "./components/FileUpload";
import DocumentAnalysis from "./components/DocumentAnalysis";

// Hooks
import { useDocumentIntelligence } from "./hooks/useDocumentIntelligence";

// Types
import { ExtractedText } from "./services/documentIntelligence";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ file: File; name: string; size: string }>
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [mobileActiveTab, setMobileActiveTab] = useState<
    "files" | "viewer" | "analysis"
  >("files");
  const [highlightedField, setHighlightedField] = useState<{
    page: number;
    boundingBox: ExtractedText["boundingBox"];
    originalField: ExtractedText;
  } | null>(null);
  const [scrollToField, setScrollToField] = useState<ExtractedText | null>(
    null
  );

  const [azureConfig] = useState({
    endpoint:
      process.env.NEXT_PUBLIC_AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT || "",
    apiKey: process.env.NEXT_PUBLIC_AZURE_DOCUMENT_INTELLIGENCE_API_KEY || "",
  });

  const { analyzeDocument, isAnalyzing, result, error, clearResult } =
    useDocumentIntelligence(azureConfig);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPdfUrl(url);

    // Add to uploaded files list if not already there
    const fileExists = uploadedFiles.some(
      (f) =>
        f.name === file.name &&
        f.size === (file.size / 1024 / 1024).toFixed(2) + " MB"
    );
    if (!fileExists) {
      setUploadedFiles((prev) => [
        ...prev,
        {
          file,
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        },
      ]);
    }

    clearResult();
    setHighlightedField(null); // Clear any highlighted field
    setScrollToField(null); // Clear any scroll target

    // Auto switch to viewer tab on mobile when file is selected
    setMobileActiveTab("viewer");

    // Auto analyze the document
    if (azureConfig.endpoint && azureConfig.apiKey) {
      analyzeDocument(file);
    }
  };

  const handleFileFromList = (uploadedFile: {
    file: File;
    name: string;
    size: string;
  }) => {
    setSelectedFile(uploadedFile.file);
    const url = URL.createObjectURL(uploadedFile.file);
    setPdfUrl(url);
    setHighlightedField(null); // Clear any highlighted field
    setScrollToField(null); // Clear any scroll target

    // Auto switch to viewer tab on mobile when file is selected
    setMobileActiveTab("viewer");

    // analyzeDocument will check for cached results internally
    if (azureConfig.endpoint && azureConfig.apiKey) {
      analyzeDocument(uploadedFile.file);
    }
  };

  const handleFieldClick = (field: ExtractedText) => {
    setHighlightedField({
      page: field.page,
      boundingBox: field.boundingBox,
      originalField: field,
    });

    // Auto switch to viewer tab on mobile when field is clicked
    setMobileActiveTab("viewer");
  };

  const handleBoundingBoxClick = (field: ExtractedText) => {
    setScrollToField(field);

    // Auto switch to analysis tab on mobile when bounding box is clicked
    setMobileActiveTab("analysis");

    // Clear the scroll target after a delay to avoid continuous scrolling
    setTimeout(() => setScrollToField(null), 1000);
  };

  const configurationMissing = !azureConfig.endpoint || !azureConfig.apiKey;

  // Filter files based on search query
  const filteredFiles = uploadedFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex space-x-1">
          <button
            onClick={() => setMobileActiveTab("files")}
            className={`flex-1 px-3 py-2 text-sm rounded-md ${
              mobileActiveTab === "files"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📁 Files
          </button>
          <button
            onClick={() => setMobileActiveTab("viewer")}
            className={`flex-1 px-3 py-2 text-sm rounded-md ${
              mobileActiveTab === "viewer"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📄 Viewer
          </button>
          <button
            onClick={() => setMobileActiveTab("analysis")}
            className={`flex-1 px-3 py-2 text-sm rounded-md ${
              mobileActiveTab === "analysis"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            📊 Analysis
          </button>
        </div>
      </div>

      {/* Left Sidebar: File List */}
      <div
        className={`w-full md:w-80 bg-white border-r border-gray-200 flex flex-col ${
          mobileActiveTab !== "files" ? "hidden md:flex" : ""
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <FileUpload
            onFileSelect={handleFileSelect}
            isAnalyzing={isAnalyzing}
            disabled={configurationMissing}
          />
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600"
            />
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 overflow-y-auto">
          {uploadedFiles.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No documents uploaded yet
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No documents found matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredFiles.map((uploadedFile, index) => (
                <div
                  key={index}
                  onClick={() => handleFileFromList(uploadedFile)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 touch-manipulation ${
                    selectedFile?.name === uploadedFile.name
                      ? "bg-blue-50 border border-blue-200"
                      : ""
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {uploadedFile.size}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: PDF Viewer */}
      <div
        className={`flex-1 flex flex-col ${
          mobileActiveTab !== "viewer" ? "hidden md:flex" : ""
        }`}
      >
        {/* PDF Viewer Content */}
        <div className="flex-1 bg-gray-100">
          {selectedFile ? (
            <PdfViewer
              src={pdfUrl}
              highlightedField={highlightedField}
              onBoundingBoxClick={handleBoundingBoxClick}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-4 text-sm font-medium text-gray-900">
                  No document selected
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Upload a PDF to get started
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Document Analysis Results */}
      <div
        className={`w-full md:w-80 bg-white border-l border-gray-200 ${
          mobileActiveTab !== "analysis" ? "hidden md:block" : ""
        }`}
      >
        <DocumentAnalysis
          result={result}
          isAnalyzing={isAnalyzing}
          error={error}
          configurationMissing={configurationMissing}
          onFieldClick={handleFieldClick}
          scrollToField={scrollToField}
        />
      </div>
    </div>
  );
}

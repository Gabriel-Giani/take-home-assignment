"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  DocumentAnalysisResult,
  ExtractedText,
} from "../services/documentIntelligence";

export interface DocumentAnalysisProps {
  result: DocumentAnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  configurationMissing: boolean;
  onFieldClick?: (field: ExtractedText) => void;
  scrollToField?: ExtractedText | null; // Field to scroll to
}

export default function DocumentAnalysis({
  result,
  isAnalyzing,
  error,
  configurationMissing,
  onFieldClick,
  scrollToField,
}: DocumentAnalysisProps) {
  const [activeTab, setActiveTab] = useState<"fields" | "json">("fields");
  const fieldRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // convert extracted text to fields format
  const extractFields = useCallback(() => {
    return (
      result?.extractedTexts.map((text, index) => ({
        id: `field_${index}`, // add unique field ID
        name: `Field_${index + 1}`,
        value: text.content.trim(),
        confidence: text.confidence || 0.95,
        page: text.page,
        type: "text" as const,
        originalText: text, // original extracted text
      })) || []
    );
  }, [result]);

  // Scroll to field when scrollToField prop changes
  useEffect(() => {
    if (scrollToField && result) {
      const fields = extractFields();
      const fieldToScrollTo = fields.find(
        (field) =>
          field.originalText.content === scrollToField.content &&
          field.originalText.boundingBox.xMin ===
            scrollToField.boundingBox.xMin &&
          field.originalText.boundingBox.yMin === scrollToField.boundingBox.yMin
      );

      if (fieldToScrollTo && fieldRefs.current[fieldToScrollTo.id]) {
        const fieldElement = fieldRefs.current[fieldToScrollTo.id];
        if (fieldElement && scrollContainerRef.current) {
          // Make sure we're on the fields tab
          setActiveTab("fields");

          // Scroll to the field with some offset
          setTimeout(() => {
            fieldElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "nearest",
            });

            // Add temporary highlight effect
            fieldElement.style.backgroundColor = "rgba(139, 92, 246, 0.2)";
            fieldElement.style.borderColor = "#8b5cf6";
            setTimeout(() => {
              fieldElement.style.backgroundColor = "";
              fieldElement.style.borderColor = "";
            }, 2000);
          }, 100);
        }
      }
    }
  }, [scrollToField, result, extractFields]);

  if (configurationMissing) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Document Analysis
          </h2>
        </div>
        <div className="flex-1 p-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Configuration Required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Please configure Azure Document Intelligence:</p>
                  <ul className="mt-1 list-disc list-inside">
                    <li>NEXT_PUBLIC_AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT</li>
                    <li>NEXT_PUBLIC_AZURE_DOCUMENT_INTELLIGENCE_API_KEY</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Document Analysis
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">Analyzing document...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Document Analysis
          </h2>
        </div>
        <div className="flex-1 p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Analysis Error
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Document Analysis
          </h2>
          <span className="text-xs text-gray-500">0/30</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500">
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="mt-4 text-sm font-medium">No analysis available</p>
            <p className="mt-2 text-sm">
              Select a document to see analysis results
            </p>
          </div>
        </div>
      </div>
    );
  }

  const fields = extractFields();

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.98) return "text-green-600 bg-green-50";
    if (confidence >= 0.95) return "text-green-600 bg-green-50";
    if (confidence >= 0.9) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getFieldIcon = () => {
    return "📝";
  };

  const handleFieldClick = (field: { originalText: ExtractedText }) => {
    if (onFieldClick && field.originalText) {
      onFieldClick(field.originalText);
    }
  };

  // Create JSON structure for the JSON view
  const getJsonData = () => {
    if (!result) return {};

    return {
      documentAnalysis: {
        pages: result.pages,
        totalTextElements: result.extractedTexts.length,
        extractedContent: result.extractedTexts.map((text, index) => ({
          id: index + 1,
          content: text.content,
          page: text.page,
          confidence: text.confidence || 0.95,
          boundingBox: {
            xMin: text.boundingBox.xMin,
            yMin: text.boundingBox.yMin,
            xMax: text.boundingBox.xMax,
            yMax: text.boundingBox.yMax,
            width: text.boundingBox.xMax - text.boundingBox.xMin,
            height: text.boundingBox.yMax - text.boundingBox.yMin,
          },
        })),
      },
    };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-base md:text-lg font-semibold text-gray-900">
            Document Analysis
          </h2>
          <span className="text-xs text-gray-500">
            {fields.length} {fields.length === 1 ? "field" : "fields"}
          </span>
        </div>

        {/* Fields and JSON buttons */}
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab("fields")}
            className={`flex-1 md:flex-none px-3 py-2 text-xs md:text-sm rounded touch-manipulation ${
              activeTab === "fields"
                ? "bg-gray-100 text-gray-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            Fields
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`flex-1 md:flex-none px-3 py-2 text-xs md:text-sm rounded touch-manipulation ${
              activeTab === "json"
                ? "bg-gray-100 text-gray-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            JSON
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
        {activeTab === "fields" ? (
          <div className="p-3 md:p-4">
            <div className="flex items-center space-x-2 mb-4">
              <svg
                className="w-5 h-5 text-orange-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-sm font-medium text-gray-900">
                Extracted Text
              </h3>
              <span className="text-xs text-gray-500">
                (Click any field to highlight it on the PDF)
              </span>
            </div>

            <div className="space-y-3">
              {fields.map((field) => (
                <div
                  key={field.id}
                  ref={(el) => {
                    fieldRefs.current[field.id] = el;
                  }}
                  onClick={() => handleFieldClick(field)}
                  className="border border-gray-200 rounded-lg p-3 touch-manipulation cursor-pointer hover:bg-gray-50 hover:border-purple-300 transition-all duration-200 group"
                  title="Click to highlight this field on the PDF"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getFieldIcon()}</span>
                      <span className="text-sm font-medium text-gray-900 group-hover:text-purple-700">
                        {field.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getConfidenceColor(
                          field.confidence
                        )}`}
                      >
                        ✓ {Math.round(field.confidence * 100)}%
                      </span>
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle field deletion if needed
                        }}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-1 group-hover:text-gray-800">
                    {field.value}
                  </div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-600">
                    📄 Page {field.page} • Coordinates: (
                    {field.originalText.boundingBox.xMin.toFixed(1)},{" "}
                    {field.originalText.boundingBox.yMin.toFixed(1)})
                  </div>
                </div>
              ))}
            </div>

            {fields.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No text content extracted</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-blue-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                    clipRule="evenodd"
                  />
                </svg>
                <h3 className="text-sm font-medium text-gray-900">JSON Data</h3>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(getJsonData(), null, 2)
                  );
                }}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 touch-manipulation"
              >
                Copy JSON
              </button>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-100 overflow-auto max-h-96">
              <pre>{JSON.stringify(getJsonData(), null, 2)}</pre>
            </div>

            {fields.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">No JSON data available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ExtractedText } from "../services/documentIntelligence";

export interface TabbedResultsViewerProps {
  extractedTexts: ExtractedText[];
  isLoading?: boolean;
}

type TabType = "fields" | "json";

export default function TabbedResultsViewer({
  extractedTexts,
  isLoading = false,
}: TabbedResultsViewerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("fields");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Analyzing document...</span>
      </div>
    );
  }

  if (!extractedTexts || extractedTexts.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        <div className="text-4xl mb-4">📊</div>
        <p className="text-lg font-medium mb-2">Document Analysis Results</p>
        <p className="text-sm">
          Upload a PDF file and click &quot;Analyze PDF&quot; to see the
          extracted fields and JSON data.
        </p>
      </div>
    );
  }

  // Group texts by page
  const textsByPage = extractedTexts.reduce((acc, text) => {
    if (!acc[text.page]) {
      acc[text.page] = [];
    }
    acc[text.page].push(text);
    return acc;
  }, {} as Record<number, ExtractedText[]>);

  // Create structured data for JSON view
  const jsonData = {
    documentAnalysis: {
      pages: Object.keys(textsByPage).length,
      totalTextElements: extractedTexts.length,
      extractedTexts: Object.entries(textsByPage)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([pageNum, texts]) => ({
          page: parseInt(pageNum),
          elements: texts.map((text, index) => ({
            id: `${pageNum}-${index}`,
            content: text.content,
            boundingBox: {
              xMin: text.boundingBox.xMin,
              yMin: text.boundingBox.yMin,
              xMax: text.boundingBox.xMax,
              yMax: text.boundingBox.yMax,
            },
            confidence: text.confidence,
            dimensions: {
              width: text.boundingBox.xMax - text.boundingBox.xMin,
              height: text.boundingBox.yMax - text.boundingBox.yMin,
            },
          })),
        })),
    },
  };

  // Extract potential fields (dates, numbers, key-value pairs)
  const extractFields = () => {
    const fields: Array<{
      name: string;
      value: string;
      confidence?: number;
      page: number;
      coordinates: string;
      type: "date" | "number" | "text" | "currency";
    }> = [];

    extractedTexts.forEach((text, index) => {
      const content = text.content.trim();

      // Date patterns
      const datePatterns = [
        /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
        /\b\d{1,2}-\d{1,2}-\d{4}\b/g,
        /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi,
        /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\b/gi,
      ];

      datePatterns.forEach((pattern) => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach((match) => {
            fields.push({
              name: `Date_${index}`,
              value: match,
              confidence: text.confidence,
              page: text.page,
              coordinates: `(${text.boundingBox.xMin.toFixed(
                0
              )}, ${text.boundingBox.yMin.toFixed(0)})`,
              type: "date",
            });
          });
        }
      });

      // Currency patterns
      const currencyPattern = /\$[\d,]+\.?\d*/g;
      const currencyMatches = content.match(currencyPattern);
      if (currencyMatches) {
        currencyMatches.forEach((match) => {
          fields.push({
            name: `Amount_${index}`,
            value: match,
            confidence: text.confidence,
            page: text.page,
            coordinates: `(${text.boundingBox.xMin.toFixed(
              0
            )}, ${text.boundingBox.yMin.toFixed(0)})`,
            type: "currency",
          });
        });
      }

      // Numbers
      const numberPattern = /\b\d{3,}\b/g;
      const numberMatches = content.match(numberPattern);
      if (numberMatches) {
        numberMatches.forEach((match) => {
          if (!content.match(/\$/) && match.length >= 3) {
            // Exclude currency
            fields.push({
              name: `Number_${index}`,
              value: match,
              confidence: text.confidence,
              page: text.page,
              coordinates: `(${text.boundingBox.xMin.toFixed(
                0
              )}, ${text.boundingBox.yMin.toFixed(0)})`,
              type: "number",
            });
          }
        });
      }

      // Key text (longer meaningful text)
      if (
        content.length > 2 &&
        !content.match(/^\d+$/) &&
        !content.match(/^[^\w]+$/)
      ) {
        fields.push({
          name: `Text_${index}`,
          value: content,
          confidence: text.confidence,
          page: text.page,
          coordinates: `(${text.boundingBox.xMin.toFixed(
            0
          )}, ${text.boundingBox.yMin.toFixed(0)})`,
          type: "text",
        });
      }
    });

    return fields;
  };

  const fields = extractFields();

  const getFieldIcon = (type: string) => {
    switch (type) {
      case "date":
        return "📅";
      case "currency":
        return "💰";
      case "number":
        return "#️⃣";
      default:
        return "📝";
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "bg-gray-100 text-gray-800";
    if (confidence > 0.9) return "bg-green-100 text-green-800";
    if (confidence > 0.7) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4 py-2">
          <button
            onClick={() => setActiveTab("fields")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "fields"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Fields
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "json"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            JSON
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === "fields" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Extracted Fields ({fields.length})
              </h3>
              <div className="text-sm text-gray-600">
                {Object.keys(textsByPage).length} page(s)
              </div>
            </div>

            {fields.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No structured fields detected in this document.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">
                            {getFieldIcon(field.type)}
                          </span>
                          <span className="font-medium text-gray-700">
                            {field.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            Page {field.page}
                          </span>
                        </div>
                        <div className="text-gray-900 font-mono text-sm mb-2">
                          {field.value}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>📍 Coordinates: {field.coordinates}</span>
                          {field.confidence && (
                            <span
                              className={`px-2 py-1 rounded ${getConfidenceColor(
                                field.confidence
                              )}`}
                            >
                              {(field.confidence * 100).toFixed(1)}% confidence
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Raw JSON Data
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    JSON.stringify(jsonData, null, 2)
                  );
                  alert("JSON copied to clipboard!");
                }}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded"
              >
                Copy JSON
              </button>
            </div>

            <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto font-mono text-sm">
              <pre>{JSON.stringify(jsonData, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

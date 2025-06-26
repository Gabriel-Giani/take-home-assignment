"use client";

import { ExtractedText } from "../services/documentIntelligence";

export interface ExtractedTextViewerProps {
  extractedTexts: ExtractedText[];
  isLoading?: boolean;
}

export default function ExtractedTextViewer({
  extractedTexts,
  isLoading = false,
}: ExtractedTextViewerProps) {
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
        <p className="text-lg font-medium mb-2">Extracted Text Results</p>
        <p className="text-sm">
          Upload a PDF file and click &quot;Analyze PDF&quot; to see the
          extracted text with bounding box coordinates.
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

  return (
    <div className="h-full overflow-auto space-y-6">
      <div className="sticky top-0 bg-white border-b pb-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Extracted Text ({extractedTexts.length} items)
        </h3>
        <p className="text-sm text-gray-600">
          {Object.keys(textsByPage).length} page(s) analyzed
        </p>
      </div>

      {Object.entries(textsByPage)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([pageNum, texts]) => (
          <div key={pageNum} className="mb-6">
            <h4 className="text-md font-medium text-gray-700 mb-3 border-l-4 border-blue-500 pl-2">
              Page {pageNum}
            </h4>

            <div className="space-y-2">
              {texts.map((text, index) => (
                <div
                  key={`${pageNum}-${index}`}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors"
                >
                  <div className="font-mono text-sm text-gray-800 mb-2">
                    {text.content}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Bounding Box:</span>
                      <span>
                        ({text.boundingBox.xMin.toFixed(1)},{" "}
                        {text.boundingBox.yMin.toFixed(1)}) → (
                        {text.boundingBox.xMax.toFixed(1)},{" "}
                        {text.boundingBox.yMax.toFixed(1)})
                      </span>
                    </div>

                    {text.confidence && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium">Confidence:</span>
                        <span
                          className={`px-1 py-0.5 rounded text-xs ${
                            text.confidence > 0.9
                              ? "bg-green-100 text-green-800"
                              : text.confidence > 0.7
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {(text.confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <span className="font-medium">Size:</span>
                      <span>
                        {(
                          text.boundingBox.xMax - text.boundingBox.xMin
                        ).toFixed(1)}{" "}
                        ×{" "}
                        {(
                          text.boundingBox.yMax - text.boundingBox.yMin
                        ).toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

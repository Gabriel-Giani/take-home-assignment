"use client";

import { useState, useEffect, useRef } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";
import { BoundingBox, ExtractedText } from "../services/documentIntelligence";

export interface PdfViewerProps {
  /**
   * Absolute or relative URL to the PDF document.
   * Example: "/tickets.pdf" (served from the `public` folder)
   */
  src: string;
  debugMode?: boolean;
  /**
   * Highlighted bounding box to show when a field is clicked
   */
  highlightedField?: {
    page: number;
    boundingBox: BoundingBox;
    originalField: ExtractedText; // The original extracted text object
  } | null;
  /**
   * Callback when the purple bounding box is clicked
   */
  onBoundingBoxClick?: (field: ExtractedText) => void;
}

/**
 * A PDF viewer that displays one page at a time with navigation controls.
 *
 * The component disables server-side rendering (via the `use client` directive)
 * because `pdfjs` relies on browser APIs.
 */
export default function PdfViewer({
  src,
  debugMode = false,
  highlightedField,
  onBoundingBoxClick,
}: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  // Use a CDN version of `pdfjs-dist` that matches the installed major version.
  const pdfjsVersion = "3.11.174";

  // Create plugins
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const zoomPluginInstance = zoomPlugin();

  const {
    GoToFirstPage,
    GoToLastPage,
    GoToNextPage,
    GoToPreviousPage,
    CurrentPageInput,
    jumpToPage,
  } = pageNavigationPluginInstance;

  const { ZoomIn, ZoomOut, CurrentScale } = zoomPluginInstance;

  const handleDocumentLoad = (e: { doc: { numPages: number } }) => {
    setNumPages(e.doc.numPages);
  };

  const handlePageChange = (e: { currentPage: number }) => {
    setCurrentPage(e.currentPage);
  };

  const handleZoom = (e: { scale: number }) => {
    console.log("Zoom event:", e.scale);
    setScale(e.scale);
  };

  // Track scale changes from the CurrentScale component
  useEffect(() => {
    const trackScale = () => {
      if (viewerContainerRef.current) {
        const scaleElement =
          viewerContainerRef.current.querySelector(".rpv-zoom__scale");
        if (scaleElement) {
          const scaleText = scaleElement.textContent;
          if (scaleText) {
            const scaleValue = parseFloat(scaleText.replace("%", "")) / 100;
            if (scaleValue !== scale) {
              setScale(scaleValue);
            }
          }
        }
      }
    };

    const interval = setInterval(trackScale, 1000);
    return () => clearInterval(interval);
  }, [scale]);

  // Navigate to highlighted field's page when highlightedField changes
  useEffect(() => {
    if (highlightedField && jumpToPage) {
      const targetPage = highlightedField.page - 1; // Convert to 0-based index
      if (targetPage !== currentPage) {
        jumpToPage(targetPage);
      }
    }
  }, [highlightedField, jumpToPage, currentPage]);

  // Effect to attach bounding box directly to the PDF page
  useEffect(() => {
    const attachBoundingBoxToPage = () => {
      if (!highlightedField || !viewerContainerRef.current) return;

      const pageElement = viewerContainerRef.current.querySelector(
        ".rpv-core__page-layer"
      ) as HTMLElement;
      if (!pageElement) return;

      // Remove any existing bounding box
      const existingBox = pageElement.querySelector(".attached-bounding-box");
      if (existingBox) {
        existingBox.remove();
      }

      // Create new bounding box element
      const boundingBoxElement = document.createElement("div");
      boundingBoxElement.className = "attached-bounding-box";

      const { boundingBox } = highlightedField;
      const pageRect = pageElement.getBoundingClientRect();

      // Calculate position as percentages relative to the page
      const pixelsPerInch = 72;
      const pixelX = boundingBox.xMin * pixelsPerInch;
      const pixelY = boundingBox.yMin * pixelsPerInch;
      const pixelWidth = (boundingBox.xMax - boundingBox.xMin) * pixelsPerInch;
      const pixelHeight = (boundingBox.yMax - boundingBox.yMin) * pixelsPerInch;

      const scaleX = pageRect.width / 612;
      const scaleY = pageRect.height / 792;

      const scaledX = pixelX * scaleX;
      const scaledY = pixelY * scaleY;
      const scaledWidth = pixelWidth * scaleX;
      const scaledHeight = pixelHeight * scaleY;

      const leftPercent = (scaledX / pageRect.width) * 100;
      const topPercent = (scaledY / pageRect.height) * 100;
      const widthPercent = (scaledWidth / pageRect.width) * 100;
      const heightPercent = (scaledHeight / pageRect.height) * 100;

      // Apply styles
      Object.assign(boundingBoxElement.style, {
        position: "absolute",
        left: `${leftPercent}%`,
        top: `${topPercent}%`,
        width: `${widthPercent}%`,
        height: `${heightPercent}%`,
        border: "3px solid #8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        pointerEvents: "auto",
        zIndex: "1000",
        borderRadius: "2px",
        animation: "pulse 2s ease-in-out infinite",
        boxShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
        cursor: "pointer",
      });

      // Add click handler
      boundingBoxElement.addEventListener("click", () => {
        if (onBoundingBoxClick && highlightedField) {
          onBoundingBoxClick(highlightedField.originalField);
        }
      });

      // Attach to page element
      pageElement.style.position = "relative"; // Ensure page element is positioned
      pageElement.appendChild(boundingBoxElement);
    };

    // Wait for PDF to load then attach
    const timeout = setTimeout(attachBoundingBoxToPage, 500);

    return () => {
      clearTimeout(timeout);
      // Cleanup: remove bounding box when component unmounts or field changes
      if (viewerContainerRef.current) {
        const pageElement = viewerContainerRef.current.querySelector(
          ".rpv-core__page-layer"
        ) as HTMLElement;
        if (pageElement) {
          const existingBox = pageElement.querySelector(
            ".attached-bounding-box"
          );
          if (existingBox) {
            existingBox.remove();
          }
        }
      }
    };
  }, [highlightedField, currentPage, scale, onBoundingBoxClick]);

  return (
    <div className="h-full flex flex-col bg-gray-100">
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            border-color: #8b5cf6;
            background-color: rgba(139, 92, 246, 0.1);
            box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
          }
          50% {
            border-color: #a78bfa;
            background-color: rgba(139, 92, 246, 0.2);
            box-shadow: 0 0 20px rgba(139, 92, 246, 0.8);
          }
        }
        .bounding-box-highlight:hover {
          border-color: #7c3aed !important;
          background-color: rgba(139, 92, 246, 0.2) !important;
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.8) !important;
          animation: none !important;
        }
      `}</style>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <GoToPreviousPage>
            {(props) => (
              <button
                onClick={props.onClick}
                disabled={currentPage === 0}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous page"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
          </GoToPreviousPage>

          <GoToNextPage>
            {(props) => (
              <button
                onClick={props.onClick}
                disabled={currentPage === numPages - 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next page"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </GoToNextPage>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Page</span>
            <CurrentPageInput />
            <span>of {numPages}</span>
          </div>

          <div className="flex items-center gap-1 border-l border-gray-300 pl-4">
            <ZoomOut>
              {(props) => (
                <button
                  onClick={props.onClick}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Zoom out"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
                    />
                  </svg>
                </button>
              )}
            </ZoomOut>

            <div className="text-xs text-gray-500 min-w-[3rem] text-center">
              <CurrentScale>
                {(props) => <span>{Math.round(props.scale * 100)}%</span>}
              </CurrentScale>
            </div>

            <ZoomIn>
              {(props) => (
                <button
                  onClick={props.onClick}
                  className="p-2 rounded hover:bg-gray-100 transition-colors"
                  title="Zoom in"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </button>
              )}
            </ZoomIn>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GoToFirstPage>
            {(props) => (
              <button
                onClick={props.onClick}
                disabled={currentPage === 0}
                className="px-3 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="First page"
              >
                First
              </button>
            )}
          </GoToFirstPage>

          <GoToLastPage>
            {(props) => (
              <button
                onClick={props.onClick}
                disabled={currentPage === numPages - 1}
                className="px-3 py-1 text-xs rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Last page"
              >
                Last
              </button>
            )}
          </GoToLastPage>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="w-full h-full max-w-4xl mx-auto">
          <Worker
            workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`}
          >
            <div
              ref={viewerContainerRef}
              className={`pdf-container relative ${
                debugMode ? "debug-mode" : ""
              }`}
              style={{
                height: "calc(100vh - 200px)",
                maxHeight: "800px",
                border: debugMode ? "2px solid #ef4444" : "1px solid #ddd",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: debugMode ? "#fef2f2" : "white",
              }}
            >
              {debugMode && (
                <div className="absolute top-2 right-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                  DEBUG MODE
                </div>
              )}

              <Viewer
                fileUrl={src}
                plugins={[pageNavigationPluginInstance, zoomPluginInstance]}
                onDocumentLoad={handleDocumentLoad}
                onPageChange={handlePageChange}
                onZoom={handleZoom}
                initialPage={currentPage}
                defaultScale={1}
              />
            </div>
          </Worker>
        </div>
      </div>
    </div>
  );
}

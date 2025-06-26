"use client";

import { useState } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import { zoomPlugin } from "@react-pdf-viewer/zoom";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/page-navigation/lib/styles/index.css";
import "@react-pdf-viewer/zoom/lib/styles/index.css";

export interface PdfViewerProps {
  /**
   * Absolute or relative URL to the PDF document.
   * Example: "/tickets.pdf" (served from the `public` folder)
   */
  src: string;
}

/**
 * A PDF viewer that displays one page at a time with navigation controls.
 *
 * The component disables server-side rendering (via the `use client` directive)
 * because `pdfjs` relies on browser APIs.
 */
export default function PdfViewer({ src }: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [numPages, setNumPages] = useState(0);

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
  } = pageNavigationPluginInstance;

  const { ZoomIn, ZoomOut, CurrentScale } = zoomPluginInstance;

  const handleDocumentLoad = (e: { doc: { numPages: number } }) => {
    setNumPages(e.doc.numPages);
  };

  const handlePageChange = (e: { currentPage: number }) => {
    setCurrentPage(e.currentPage);
  };

  return (
    <div className="h-full flex flex-col bg-gray-100">
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
      <div className="flex-1 overflow-auto p-4">
        <div className="w-full max-w-6xl mx-auto">
          <Worker
            workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`}
          >
            <div
              className="pdf-container"
              style={{
                height: "600px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                overflow: "auto",
              }}
            >
              <Viewer
                fileUrl={src}
                plugins={[pageNavigationPluginInstance, zoomPluginInstance]}
                onDocumentLoad={handleDocumentLoad}
                onPageChange={handlePageChange}
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

"use client";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

export interface PdfViewerProps {
  /**
   * Absolute or relative URL to the PDF document.
   * Example: "/tickets.pdf" (served from the `public` folder)
   */
  src: string;
}

/**
 * A thin wrapper around `react-pdf-viewer` that works out-of-the-box with Next.js.
 *
 * The component disables server-side rendering (via the `use client` directive)
 * because `pdfjs` relies on browser APIs.
 */
export default function PdfViewer({ src }: PdfViewerProps) {
  // Use a CDN version of `pdfjs-dist` that matches the installed major version.
  const pdfjsVersion = "3.11.174";

  return (
    <Worker
      workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`}
    >
      <Viewer fileUrl={src} />
    </Worker>
  );
}

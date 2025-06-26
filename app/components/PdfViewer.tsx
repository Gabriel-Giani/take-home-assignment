"use client";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

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

  // The plugin must be created inside the component body (top-level) so that its
  // internal hooks comply with the Rules of Hooks.
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  return (
    <Worker
      workerUrl={`https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`}
    >
      {/* Full-featured toolbar via defaultLayoutPlugin */}
      <Viewer fileUrl={src} plugins={[defaultLayoutPluginInstance]} />
    </Worker>
  );
}

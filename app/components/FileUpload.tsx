"use client";

import { useRef, useState } from "react";

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isAnalyzing?: boolean;
  disabled?: boolean;
}

export default function FileUpload({
  onFileSelect,
  isAnalyzing = false,
  disabled = false,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    } else {
      alert("Please select a PDF file");
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    } else {
      alert("Please select a PDF file");
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${
            dragOver
              ? "border-blue-400 bg-blue-50 scale-105"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${isAnalyzing ? "pointer-events-none" : ""}
        `}
      >
        {isAnalyzing ? (
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <div>
              <p className="text-sm font-medium text-blue-600">
                Analyzing PDF...
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Please wait while we process your document
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Upload new</p>
              <p className="text-xs text-gray-500 mt-1">
                Drag and drop a PDF file here, or click to browse
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

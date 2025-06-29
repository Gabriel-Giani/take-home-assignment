"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DocumentIntelligenceService,
  DocumentAnalysisResult,
} from "../services/documentIntelligence";

export interface UseDocumentIntelligenceConfig {
  endpoint: string;
  apiKey: string;
}

// Add interface for cached results
interface CachedResult {
  result: DocumentAnalysisResult;
  timestamp: number;
}

export interface UseDocumentIntelligenceReturn {
  analyzeDocument: (file: File) => Promise<DocumentAnalysisResult>;
  analyzeDocumentFromUrl: (url: string) => Promise<DocumentAnalysisResult>;
  getResultForFile: (file: File) => DocumentAnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  result: DocumentAnalysisResult | null;
  clearResult: () => void;
  clearAllResults: () => void;
}

// Helper function to generate unique file identifier
function getFileId(file: File): string {
  return `${file.name}_${file.size}_${file.lastModified}`;
}

export function useDocumentIntelligence(
  config: UseDocumentIntelligenceConfig
): UseDocumentIntelligenceReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);
  const [cachedResults, setCachedResults] = useState<Map<string, CachedResult>>(
    new Map()
  );

  const service = useMemo(
    () => new DocumentIntelligenceService(config.endpoint, config.apiKey),
    [config.endpoint, config.apiKey]
  );

  const getResultForFile = useCallback(
    (file: File): DocumentAnalysisResult | null => {
      const fileId = getFileId(file);
      const cached = cachedResults.get(fileId);
      return cached ? cached.result : null;
    },
    [cachedResults]
  );

  const analyzeDocument = useCallback(
    async (file: File): Promise<DocumentAnalysisResult> => {
      const fileId = getFileId(file);

      // Check if we already have cached results for this file
      const cached = cachedResults.get(fileId);
      if (cached) {
        setResult(cached.result);
        setError(null);
        return cached.result;
      }

      setIsAnalyzing(true);
      setError(null);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const analysisResult = await service.analyzeDocument(arrayBuffer);

        // Cache the result
        setCachedResults((prev) =>
          new Map(prev).set(fileId, {
            result: analysisResult,
            timestamp: Date.now(),
          })
        );

        setResult(analysisResult);
        return analysisResult;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [service, cachedResults]
  );

  const analyzeDocumentFromUrl = useCallback(
    async (url: string): Promise<DocumentAnalysisResult> => {
      setIsAnalyzing(true);
      setError(null);

      try {
        const analysisResult = await service.analyzeDocumentFromUrl(url);
        setResult(analysisResult);
        return analysisResult;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        throw err;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [service]
  );

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  const clearAllResults = useCallback(() => {
    setCachedResults(new Map());
    setResult(null);
    setError(null);
  }, []);

  return {
    analyzeDocument,
    analyzeDocumentFromUrl,
    getResultForFile,
    isAnalyzing,
    error,
    result,
    clearResult,
    clearAllResults,
  };
}

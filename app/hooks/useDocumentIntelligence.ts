"use client";

import { useState, useCallback } from "react";
import {
  DocumentIntelligenceService,
  DocumentAnalysisResult,
} from "../services/documentIntelligence";

export interface UseDocumentIntelligenceConfig {
  endpoint: string;
  apiKey: string;
}

export interface UseDocumentIntelligenceReturn {
  analyzeDocument: (file: File) => Promise<DocumentAnalysisResult>;
  analyzeDocumentFromUrl: (url: string) => Promise<DocumentAnalysisResult>;
  isAnalyzing: boolean;
  error: string | null;
  result: DocumentAnalysisResult | null;
  clearResult: () => void;
}

export function useDocumentIntelligence(
  config: UseDocumentIntelligenceConfig
): UseDocumentIntelligenceReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DocumentAnalysisResult | null>(null);

  const service = new DocumentIntelligenceService(
    config.endpoint,
    config.apiKey
  );

  const analyzeDocument = useCallback(
    async (file: File): Promise<DocumentAnalysisResult> => {
      setIsAnalyzing(true);
      setError(null);

      try {
        const arrayBuffer = await file.arrayBuffer();
        const analysisResult = await service.analyzeDocument(arrayBuffer);
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

  return {
    analyzeDocument,
    analyzeDocumentFromUrl,
    isAnalyzing,
    error,
    result,
    clearResult,
  };
}

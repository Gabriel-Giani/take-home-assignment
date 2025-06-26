import {
  DocumentAnalysisClient,
  AzureKeyCredential,
} from "@azure/ai-form-recognizer";

export interface BoundingBox {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

export interface ExtractedText {
  content: string;
  boundingBox: BoundingBox;
  confidence?: number;
  page: number;
}

export interface DocumentAnalysisResult {
  extractedTexts: ExtractedText[];
  pages: number;
}

export class DocumentIntelligenceService {
  private client: DocumentAnalysisClient;

  constructor(endpoint: string, apiKey: string) {
    this.client = new DocumentAnalysisClient(
      endpoint,
      new AzureKeyCredential(apiKey)
    );
  }

  /**
   * Analyze a PDF document and extract text with bounding boxes
   */
  async analyzeDocument(
    fileBuffer: ArrayBuffer
  ): Promise<DocumentAnalysisResult> {
    try {
      // Use the "prebuilt-read" model for general text extraction
      const poller = await this.client.beginAnalyzeDocument(
        "prebuilt-read",
        fileBuffer
      );

      const result = await poller.pollUntilDone();

      if (!result) {
        throw new Error("Document analysis failed");
      }

      const extractedTexts: ExtractedText[] = [];

      // Process each page
      result.pages?.forEach((page, pageIndex) => {
        // Extract lines of text
        page.lines?.forEach((line) => {
          if (line.content && line.polygon && line.polygon.length >= 4) {
            // Convert polygon to bounding box (x-min, y-min, x-max, y-max)
            const xCoords = line.polygon.map((point) => point.x);
            const yCoords = line.polygon.map((point) => point.y);

            const boundingBox: BoundingBox = {
              xMin: Math.min(...xCoords),
              yMin: Math.min(...yCoords),
              xMax: Math.max(...xCoords),
              yMax: Math.max(...yCoords),
            };

            extractedTexts.push({
              content: line.content,
              boundingBox,
              page: pageIndex + 1,
            });
          }
        });

        // Also extract individual words if needed for more granular analysis
        page.words?.forEach((word) => {
          if (word.content && word.polygon && word.polygon.length >= 4) {
            const xCoords = word.polygon.map((point) => point.x);
            const yCoords = word.polygon.map((point) => point.y);

            const boundingBox: BoundingBox = {
              xMin: Math.min(...xCoords),
              yMin: Math.min(...yCoords),
              xMax: Math.max(...xCoords),
              yMax: Math.max(...yCoords),
            };

            extractedTexts.push({
              content: word.content,
              boundingBox,
              confidence: word.confidence,
              page: pageIndex + 1,
            });
          }
        });
      });

      return {
        extractedTexts,
        pages: result.pages?.length || 0,
      };
    } catch (error) {
      console.error("Error analyzing document:", error);
      throw new Error(`Document analysis failed: ${error}`);
    }
  }

  /**
   * Analyze a PDF from a URL
   */
  async analyzeDocumentFromUrl(url: string): Promise<DocumentAnalysisResult> {
    try {
      const poller = await this.client.beginAnalyzeDocumentFromUrl(
        "prebuilt-read",
        url
      );

      const result = await poller.pollUntilDone();

      if (!result) {
        throw new Error("Document analysis failed");
      }

      const extractedTexts: ExtractedText[] = [];

      result.pages?.forEach((page, pageIndex) => {
        page.lines?.forEach((line) => {
          if (line.content && line.polygon && line.polygon.length >= 4) {
            const xCoords = line.polygon.map((point) => point.x);
            const yCoords = line.polygon.map((point) => point.y);

            const boundingBox: BoundingBox = {
              xMin: Math.min(...xCoords),
              yMin: Math.min(...yCoords),
              xMax: Math.max(...xCoords),
              yMax: Math.max(...yCoords),
            };

            extractedTexts.push({
              content: line.content,
              boundingBox,
              page: pageIndex + 1,
            });
          }
        });
      });

      return {
        extractedTexts,
        pages: result.pages?.length || 0,
      };
    } catch (error) {
      console.error("Error analyzing document:", error);
      throw new Error(`Document analysis failed: ${error}`);
    }
  }
}

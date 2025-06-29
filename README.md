# PDF Document Intelligence with Azure

This Next.js application demonstrates how to use Microsoft Azure Document Intelligence to extract text and bounding box coordinates from PDF documents using OCR.

## Features

- **PDF Viewer**: Display PDF documents in the browser
- **Text Extraction**: Extract text with precise coordinates using Azure Document Intelligence
- **Bounding Box Information**: Get x-min, y-min, x-max, y-max coordinates for each text element
- **Confidence Scores**: View OCR confidence levels for extracted text
- **Page-by-Page Analysis**: Organized results by document pages

## Prerequisites

1. **Azure Account**: You need an active Azure subscription
2. **Document Intelligence Resource**: Create a Document Intelligence resource in Azure Portal

## Setup Instructions

### 1. Azure Document Intelligence Setup

1. Go to the [Azure Portal](https://portal.azure.com)
2. Create a new "Document Intelligence" resource
3. Once deployed, go to "Keys and Endpoint" section
4. Copy the **Endpoint** and **Key 1** (or Key 2)

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Azure Document Intelligence Configuration
NEXT_PUBLIC_AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=https://your-resource-name.cognitiveservices.azure.com/
NEXT_PUBLIC_AZURE_DOCUMENT_INTELLIGENCE_API_KEY=your-api-key-here
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## How It Works

1. **PDF Display**: The left panel shows the PDF using `react-pdf-viewer`
2. **Analysis**: Click "Analyze PDF" to send the document to Azure Document Intelligence
3. **Results**: The right panel displays extracted text with:
   - Text content
   - Bounding box coordinates (x-min, y-min, x-max, y-max)
   - Confidence scores
   - Text dimensions

## API Usage

The application uses Azure Document Intelligence's `prebuilt-read` model which is optimized for:

- Text extraction from documents
- Multi-language support
- High accuracy OCR
- Bounding box detection

## Environment Variables

| Variable                                           | Description                                   |
| -------------------------------------------------- | --------------------------------------------- |
| `NEXT_PUBLIC_AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT` | Your Azure Document Intelligence endpoint URL |
| `NEXT_PUBLIC_AZURE_DOCUMENT_INTELLIGENCE_API_KEY`  | Your Azure Document Intelligence API key      |

## Troubleshooting

1. **Authentication Errors**: Verify your endpoint URL and API key
2. **CORS Issues**: Ensure your Azure resource allows requests from your domain
3. **Rate Limiting**: Azure has rate limits; implement retry logic for production use

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Remember to add your environment variables in the Vercel dashboard.

## Original Next.js Information

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

For more information about Next.js:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

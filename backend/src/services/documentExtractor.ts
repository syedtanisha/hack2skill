/**
 * Document Text Extractor Service
 * Extracts readable plain text from PDF, DOCX, PPTX, and TXT files.
 * Rejects empty documents and image-only scans without selectable text.
 */

export interface ExtractionResult {
  text: string;
  pageCount?: number;
  wordCount: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

export async function extractDocumentText(
  buffer: Buffer,
  fileName: string,
  explicitType?: string
): Promise<ExtractionResult> {
  // 1. Validate file size
  if (!buffer || buffer.length === 0) {
    throw new Error(`File '${fileName}' is empty (0 bytes).`);
  }

  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error(
      `File '${fileName}' exceeds the 10MB limit (${(buffer.length / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller document.`
    );
  }

  // 2. Determine file extension
  const ext = (explicitType || fileName.split('.').pop() || '').toLowerCase().replace(/^\./, '');
  let extractedText = '';
  let pageCount: number | undefined;

  try {
    if (ext === 'txt' || ext === 'text') {
      extractedText = buffer.toString('utf-8');
      pageCount = 1;
    } else if (ext === 'pdf') {
      // PDF text extraction using pdf-parse
      try {
        const pdfModule: any = await import('pdf-parse');
        const pdfParser = pdfModule.default || pdfModule;
        const pdfData = await pdfParser(buffer);
        extractedText = pdfData.text || '';
        pageCount = pdfData.numpages || 1;
      } catch (pdfErr: any) {
        throw new Error(`Failed to parse PDF document: ${pdfErr.message}`);
      }
    } else if (ext === 'docx') {
      // DOCX text extraction using mammoth
      try {
        const mammothModule: any = await import('mammoth');
        const mammoth = mammothModule.default || mammothModule;
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value || '';
        pageCount = 1;
      } catch (docxErr: any) {
        throw new Error(`Failed to extract text from DOCX document: ${docxErr.message}`);
      }
    } else if (ext === 'pptx') {
      // PPTX presentation slide extraction using jszip
      try {
        const jszipModule: any = await import('jszip');
        const JSZip = jszipModule.default || jszipModule;
        const zip = await JSZip.loadAsync(buffer);
        const slideFiles = Object.keys(zip.files).filter(name =>
          /^ppt\/slides\/slide\d+\.xml$/i.test(name)
        );

        slideFiles.sort((a, b) => {
          const matchA = a.match(/\d+/);
          const matchB = b.match(/\d+/);
          const numA = matchA ? parseInt(matchA[0], 10) : 0;
          const numB = matchB ? parseInt(matchB[0], 10) : 0;
          return numA - numB;
        });

        const slideSnippets: string[] = [];
        for (let i = 0; i < slideFiles.length; i++) {
          const slideName = slideFiles[i];
          const xml = await zip.files[slideName].async('text');
          const matches = xml.match(/<a:t[^>]*>(.*?)<\/a:t>/gi) || [];
          const textItems = matches
            .map((m: string) => m.replace(/<\/?[^>]+(>|$)/g, '').trim())
            .filter(Boolean);
          if (textItems.length > 0) {
            slideSnippets.push(`[Slide ${i + 1}]:\n${textItems.join(' ')}`);
          }
        }

        extractedText = slideSnippets.join('\n\n');
        pageCount = slideFiles.length;
      } catch (pptxErr: any) {
        throw new Error(`Failed to extract text from PPTX presentation: ${pptxErr.message}`);
      }
    } else {
      throw new Error(
        `Unsupported file type '.${ext}'. Please upload a PDF (.pdf), Word document (.docx), PowerPoint slide deck (.pptx), or plain text file (.txt).`
      );
    }
  } catch (err: any) {
    throw new Error(err.message || `Error processing document '${fileName}'`);
  }

  // 3. Validate extracted text content
  const cleanText = (extractedText || '').trim();
  if (cleanText.length < 20) {
    throw new Error(
      `No readable text could be extracted from '${fileName}'. Scanned images without selectable text are not supported. Please upload a text-based document or notes file.`
    );
  }

  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;

  return {
    text: cleanText,
    pageCount,
    wordCount,
  };
}

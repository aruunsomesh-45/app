import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for pdf.js
// Set worker path for pdf.js - use reliable CDNs
const PDFJS_VERSION = pdfjsLib.version;
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.mjs`;

// Fallback to cdnjs if unpkg fails (will happen on next load if first fails)
const checkWorker = async () => {
    try {
        const resp = await fetch(pdfjsLib.GlobalWorkerOptions.workerSrc, { method: 'HEAD' });
        if (!resp.ok) throw new Error();
    } catch {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;
    }
};
checkWorker();

/**
 * Convert a File to a data URL
 */
export const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Extract the first page of a PDF as an image data URL
 */
export const extractPdfCover = async (pdfDataUrl: string): Promise<string> => {
    try {
        console.log('ExtractPdfCover: Starting extraction...');

        // Convert data URL to Uint8Array for more reliable loading
        const base64 = pdfDataUrl.split(',')[1];
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        console.log(`ExtractPdfCover: Loading document (${(len / 1024 / 1024).toFixed(2)} MB)...`);

        // Load the PDF document
        const loadingTask = pdfjsLib.getDocument({
            data: bytes,
            useWorkerFetch: false,
            isEvalSupported: false,
        });

        const pdf = await loadingTask.promise;
        console.log('ExtractPdfCover: Document loaded, pages:', pdf.numPages);

        // Get the first page
        const page = await pdf.getPage(1);
        console.log('ExtractPdfCover: Page 1 retrieved');

        // Set scale for better quality
        const scale = 1.5; // Reduced from 2 for better performance
        const viewport = page.getViewport({ scale });

        // Create a canvas to render the page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Could not get canvas context');
        }

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        console.log('ExtractPdfCover: Rendering page to canvas...');

        // Render the page
        await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
        }).promise;

        console.log('ExtractPdfCover: Rendering complete');

        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // Slightly lower quality for smaller size
        return dataUrl;
    } catch (error: unknown) {
        console.error('Detailed error extracting PDF cover:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`PDF Cover Extraction failed: ${errorMessage}`);
    }
};

/**
 * Process a PDF file: convert to data URL and extract cover
 */
export const processPdfFile = async (file: File): Promise<{
    dataUrl: string;
    coverImage: string;
    fileName: string;
    fileSize: number;
}> => {
    try {
        // Convert file to data URL
        const dataUrl = await fileToDataUrl(file);

        // Extract cover page
        const coverImage = await extractPdfCover(dataUrl);

        return {
            dataUrl,
            coverImage,
            fileName: file.name,
            fileSize: file.size,
        };
    } catch (error) {
        console.error('Error processing PDF file:', error);
        throw error;
    }
};

/**
 * Open PDF in a new window/tab using Blob URL for better browser compatibility
 */
export const openPdfInNewTab = (pdfDataUrl: string, title: string) => {
    try {
        // Convert data URL to Blob
        const byteString = atob(pdfDataUrl.split(',')[1]);
        const mimeString = pdfDataUrl.split(',')[0].split(':')[1].split(';')[0];

        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([ab], { type: mimeString });
        const blobUrl = URL.createObjectURL(blob);

        // Open in new tab
        const newWindow = window.open(blobUrl, '_blank');

        if (!newWindow) {
            // Fallback: create download link if popup blocked
            alert('Pop-up blocked! Click OK to download the PDF instead.');
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${title}.pdf`;
            link.click();
            URL.revokeObjectURL(blobUrl);
        } else {
            // Set page title
            newWindow.onload = () => {
                newWindow.document.title = title;
            };

            // Clean up blob URL after a delay
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 1000);
        }
    } catch (error) {
        console.error('Error opening PDF:', error);
        alert('Failed to open PDF. Please make sure it\'s a valid PDF file.');
    }
};

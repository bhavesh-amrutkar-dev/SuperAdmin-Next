import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set the worker
pdfjs.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.227/pdf.worker.min.js';

export const PdfViewer = ({ url }: { url: string }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null); // <-- ArrayBuffer
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);

  // Fetch PDF as Blob for private URLs
  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch PDF');

        const blob = await res.blob();
        const arrayBuffer = await blob.arrayBuffer(); // <-- keep as ArrayBuffer
        setPdfData(arrayBuffer); // <-- pass ArrayBuffer directly
      } catch (err) {
        console.error('PDF fetch error:', err);
      }
    };

    fetchPdf();
  }, [url]);

  // Update width based on container size
  useEffect(() => {
    if (containerRef.current) {
      setWidth(containerRef.current.offsetWidth);
    }
  }, [containerRef.current?.offsetWidth]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-[600px] overflow-auto border rounded-lg my-4"
    >
      {pdfData ? (
        <Document
          file={pdfData} // <-- now correctly ArrayBuffer
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => console.error('PDF failed to load:', err)}
        >
          {Array.from({ length: numPages }, (_, index) => (
            <Page key={index} pageNumber={index + 1} width={width} />
          ))}
        </Document>
      ) : (
        <p className="text-gray-500">Loading PDF...</p>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { saveAs } from 'file-saver';
import { PDFDocument } from 'pdf-lib';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [compressionRatio, setCompressionRatio] = useState(70);
  const [compressedFileUrl, setCompressedFileUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setCompressedFileUrl(null);
    }
  };

  const handleCompress = async () => {
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const options = {
        maxSizeMB: (100 - compressionRatio) / 10,
        useWebWorker: true,
      };

      try {
        const compressed = await imageCompression(file, options);
        const url = URL.createObjectURL(compressed);
        setCompressedFileUrl(url);
      } catch (err) {
        console.error('Image compression failed', err);
      }
    } else if (file.type === 'application/pdf') {
      try {
        const existingPdfBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const compressedBytes = await pdfDoc.save({ useObjectStreams: false }); // basic compression
        const blob = new Blob([compressedBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setCompressedFileUrl(url);
      } catch (err) {
        console.error('PDF compression failed', err);
      }
    }
  };

  const handleDownload = () => {
    if (compressedFileUrl && file) {
      saveAs(compressedFileUrl, `compressed-${file.name}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6 text-center">Compressor Image & PDF</h1>

      <input type="file" accept="image/*,application/pdf" onChange={handleFileChange} />

      <div className="mt-4 w-full max-w-md">
        <label htmlFor="quality" className="block mb-1 font-semibold">
          Compression Level: {compressionRatio}%
        </label>
        <input
          type="range"
          id="quality"
          min="10"
          max="100"
          value={compressionRatio}
          onChange={(e) => setCompressionRatio(parseInt(e.target.value))}
          className="w-full"
        />
      </div>

      <button
        onClick={handleCompress}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        disabled={!file}
      >
        Compress
      </button>

      {compressedFileUrl && (
        <div className="mt-6 flex flex-col items-center">
          {file?.type.startsWith('image/') && (
            <img
              src={compressedFileUrl}
              alt="Compressed"
              className="max-w-xs border rounded shadow"
            />
          )}

          <button
            onClick={handleDownload}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download Compressed File
          </button>
        </div>
      )}
    </div>
  );
};

export default App;

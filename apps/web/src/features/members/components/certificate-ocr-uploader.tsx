'use client';

import { useRef, useState } from 'react';
import type { OcrResult } from '../api';
import { uploadCertificateForOcr } from '../api';

interface Props {
  onOcrResult: (result: OcrResult) => void;
}

export function CertificateOcrUploader({ onOcrResult }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFile = async (file: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowed.includes(file.type)) {
      setError('JPEG、PNG、WebP、PDF形式のファイルを選択してください。');
      return;
    }

    setError('');
    setFileName(file.name);
    setIsAnalyzing(true);

    try {
      const result = await uploadCertificateForOcr(file);
      onOcrResult(result);
    } catch {
      setError('手帳の解析に失敗しました。もう一度お試しください。');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-purple-300 bg-purple-50 p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-300 border-t-purple-600" />
        <p className="text-sm font-medium text-purple-700">
          手帳を解析中...
        </p>
        {fileName && (
          <p className="text-xs text-purple-500">{fileName}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors ${
          isDragging
            ? 'border-[#ffc000] bg-yellow-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
      >
        <svg
          className="h-10 w-10 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
          />
        </svg>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            障害者手帳の画像/PDFをアップロード
          </p>
          <p className="mt-1 text-xs text-gray-500">
            ドラッグ&ドロップ、またはボタンから選択
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            ファイルを選択
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

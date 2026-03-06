'use client';

import { useEffect, useState } from 'react';
import { fetchQrStory, submitQrThanks, type QrStoryData } from '../api';
import { ThankYouSuccess } from './thank-you-success';

interface QrStoryPageProps {
  token: string;
}

export function QrStoryPage({ token }: QrStoryPageProps) {
  const [story, setStory] = useState<QrStoryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [senderName, setSenderName] = useState('');

  useEffect(() => {
    fetchQrStory(token)
      .then(setStory)
      .catch((err) => setError(err.message || 'エラーが発生しました'))
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submitQrThanks(token, {
        senderDisplayName: senderName || undefined,
      });
      setSent(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'エラーが発生しました';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-amber-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-300 border-t-amber-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-amber-50 px-6 text-center">
        <div className="mb-4 text-5xl" role="img" aria-label="注意">
          ⚠️
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-800">
          ページを表示できません
        </h2>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-amber-50">
        <ThankYouSuccess />
      </div>
    );
  }

  if (!story) return null;

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header with flower illustration */}
      <div className="flex flex-col items-center pt-12 pb-6">
        <div className="mb-4 text-7xl" role="img" aria-label="花">
          🌸
        </div>
        <h1 className="text-center text-lg font-bold leading-relaxed text-gray-800">
          この花は
          <br />
          <span className="text-xl text-amber-700">
            {story.memberDisplayName}
          </span>
          さんが
          <br />
          <span className="text-amber-600">{story.siteName}</span>
          で
          <br />
          心を込めて作りました
        </h1>
      </div>

      {/* Story card */}
      <div className="px-5 pb-6">
        <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
          <p className="whitespace-pre-wrap text-base leading-relaxed text-gray-700">
            {story.storyText}
          </p>
        </div>
      </div>

      {/* Optional name input */}
      <div className="px-5 pb-4">
        <label className="mb-1.5 block text-sm font-medium text-gray-600">
          お名前（任意）
        </label>
        <input
          type="text"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          placeholder="入力しなくても送れます"
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        />
      </div>

      {/* Big thank you button */}
      <div className="px-5 pb-12">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-2xl bg-amber-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-amber-600 active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? '送信中...' : '🙏 ありがとうを届ける'}
        </button>
      </div>
    </div>
  );
}

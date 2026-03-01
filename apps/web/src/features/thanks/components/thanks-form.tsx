'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import { showToast } from '../../../components/toast';
import { sendThanks } from '../api';
import { THANKS_CATEGORIES } from '../categories';

interface ThanksFormProps {
  onSent: () => void;
}

export function ThanksForm({ onSent }: ThanksFormProps) {
  const router = useRouter();
  const [toUserId, setToUserId] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await sendThanks({ toUserId: toUserId.trim(), content: content.trim(), category });
      showToast('感謝を送りました', 'success');
      setToUserId('');
      setCategory('');
      setContent('');
      onSent();
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.statusCode === 401) {
          authStore.removeToken();
          router.replace('/login');
          return;
        }
        if (err.statusCode === 400) {
          setError(err.message);
        } else {
          setError('送信に失敗しました。しばらく経ってから再度お試しください。');
        }
      } else {
        setError('送信に失敗しました。しばらく経ってから再度お試しください。');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const isValid = toUserId.trim() !== '' && category !== '' && content.trim() !== '';

  return (
    <section
      className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/60 to-amber-50/40 p-6"
      aria-labelledby="thanks-form-heading"
    >
      <h2
        id="thanks-form-heading"
        className="mb-4 text-lg font-semibold text-gray-900"
      >
        感謝を送る
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="thanks-to"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            送り先ユーザーID
          </label>
          <input
            id="thanks-to"
            type="text"
            value={toUserId}
            onChange={(e) => setToUserId(e.target.value)}
            placeholder="ユーザーIDを入力"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-medium text-gray-700">
            カテゴリー
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {THANKS_CATEGORIES.map((cat) => {
              const isSelected = category === cat.value;
              return (
                <label
                  key={cat.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2.5 transition-colors ${
                    isSelected
                      ? `${cat.borderColor} ${cat.selectedBgColor}`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="thanks-category"
                    value={cat.value}
                    checked={isSelected}
                    onChange={() => setCategory(cat.value)}
                    className="sr-only"
                  />
                  <span aria-hidden="true">{cat.emoji}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {cat.label}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div>
          <label
            htmlFor="thanks-content"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            メッセージ
          </label>
          <textarea
            id="thanks-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="ありがとうの気持ちを伝えましょう"
            rows={3}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? '送信中...' : '感謝を送る'}
        </button>
      </form>
    </section>
  );
}

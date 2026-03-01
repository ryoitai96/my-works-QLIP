'use client';

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import { type ThanksCard as ThanksCardType, fetchReceivedThanks } from '../api';
import { ThanksCard } from './thanks-card';

export interface ThanksListHandle {
  reload: () => void;
}

export const ThanksList = forwardRef<ThanksListHandle>(
  function ThanksList(_props, ref) {
    const router = useRouter();
    const [cards, setCards] = useState<ThanksCardType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const loadCards = useCallback(async () => {
      if (!authStore.isAuthenticated()) {
        router.replace('/login');
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const data = await fetchReceivedThanks();
        setCards(data);
      } catch (err) {
        if (err instanceof ApiClientError && err.statusCode === 401) {
          authStore.removeToken();
          router.replace('/login');
          return;
        }
        setError(
          'データの取得に失敗しました。しばらく経ってから再度お試しください。',
        );
      } finally {
        setIsLoading(false);
      }
    }, [router]);

    useImperativeHandle(ref, () => ({ reload: loadCards }), [loadCards]);

    useEffect(() => {
      loadCards();
    }, [loadCards]);

    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-gray-200 bg-gray-100"
            />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="mb-4 text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={loadCards}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
          >
            再読み込み
          </button>
        </div>
      );
    }

    if (cards.length === 0) {
      return (
        <p className="py-12 text-center text-sm text-gray-500">
          届いた感謝はまだありません。
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {cards.map((card) => (
          <ThanksCard key={card.id} card={card} />
        ))}
      </div>
    );
  },
);

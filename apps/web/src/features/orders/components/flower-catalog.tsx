'use client';

import { useEffect, useState } from 'react';
import { type FlowerProduct, fetchCatalog } from '../api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

const CATEGORY_COLORS: Record<string, string> = {
  'バラ': 'bg-rose-100 text-rose-700',
  'チューリップ': 'bg-pink-100 text-pink-700',
  'ガーベラ': 'bg-orange-100 text-orange-700',
  'ドライフラワー': 'bg-amber-100 text-amber-700',
  'ハーバリウム': 'bg-purple-100 text-purple-700',
  'カーネーション': 'bg-red-100 text-red-700',
  'ひまわり': 'bg-yellow-100 text-yellow-700',
  'ユリ': 'bg-emerald-100 text-emerald-700',
};

interface Props {
  onSelect: (product: FlowerProduct) => void;
}

export function FlowerCatalog({ onSelect }: Props) {
  const [products, setProducts] = useState<FlowerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalog()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#0077c7]" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
        <p className="text-gray-500">現在、販売中の商品はありません</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <button
          key={product.id}
          type="button"
          onClick={() => onSelect(product)}
          className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition-all hover:shadow-md hover:border-[#0077c7]/50"
        >
          {product.imageUrl ? (
            <img
              src={`${API_BASE}${product.imageUrl}`}
              alt={product.name}
              className="h-48 w-full object-cover transition-transform group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-pink-50 to-rose-100">
              <svg
                className="h-16 w-16 text-pink-300"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5 2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53L12 21.35z"
                />
              </svg>
            </div>
          )}
          <div className="flex flex-1 flex-col p-4">
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  CATEGORY_COLORS[product.category] ?? 'bg-gray-100 text-gray-700'
                }`}
              >
                {product.category}
              </span>
            </div>
            <h3 className="mb-1 text-base font-bold text-gray-900">
              {product.name}
            </h3>
            {product.description && (
              <p className="mb-3 line-clamp-2 text-sm text-gray-500">
                {product.description}
              </p>
            )}
            <div className="mt-auto">
              <p className="text-lg font-bold text-gray-900">
                {product.price.toLocaleString()}
                <span className="ml-0.5 text-sm font-normal">円</span>
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

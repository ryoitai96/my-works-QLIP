'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import {
  type FlowerProduct,
  fetchProducts,
  updateProduct,
} from '../api';
import { ProductFormModal } from './product-form-modal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

type SortKey = 'productCode' | 'name' | 'category' | 'price' | 'createdAt';
type SortOrder = 'asc' | 'desc';

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {active ? '有効' : '無効'}
    </span>
  );
}

function SortIndicator({ active, order }: { active: boolean; order: SortOrder }) {
  if (!active) return <span className="ml-1 text-gray-300">▲</span>;
  return <span className="ml-1">{order === 'asc' ? '▲' : '▼'}</span>;
}

export function ProductsPageContent() {
  const router = useRouter();
  const [products, setProducts] = useState<FlowerProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('productCode');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [modalProduct, setModalProduct] = useState<FlowerProduct | null | 'new'>(null);

  const load = useCallback(async () => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
        return;
      }
      setError('商品一覧の取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleToggleActive = async (product: FlowerProduct) => {
    try {
      await updateProduct(product.id, { isActive: !product.isActive });
      await load();
    } catch {
      setError('ステータスの更新に失敗しました。');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    let result = products;

    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.productCode.toLowerCase().includes(q),
      );
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'productCode':
          cmp = a.productCode.localeCompare(b.productCode);
          break;
        case 'name':
          cmp = a.name.localeCompare(b.name, 'ja');
          break;
        case 'category':
          cmp = a.category.localeCompare(b.category, 'ja');
          break;
        case 'price':
          cmp = a.price - b.price;
          break;
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [products, search, sortKey, sortOrder]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="rounded-xl bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={load}
          className="mt-3 text-sm font-medium text-red-600 hover:text-red-800"
        >
          再読み込み
        </button>
      </div>
    );
  }

  const thClass =
    'px-5 py-3 cursor-pointer select-none transition-colors hover:text-gray-700';

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="商品名・カテゴリ・コードで検索..."
            className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]/30"
          />
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          onClick={() => setModalProduct('new')}
          className="shrink-0 rounded-lg bg-[#ffc000] px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors hover:bg-[#e6ad00]"
        >
          新規登録
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wider text-gray-500">
                <th className={thClass} onClick={() => handleSort('productCode')}>
                  コード
                  <SortIndicator active={sortKey === 'productCode'} order={sortOrder} />
                </th>
                <th className="px-5 py-3">画像</th>
                <th className={thClass} onClick={() => handleSort('name')}>
                  商品名
                  <SortIndicator active={sortKey === 'name'} order={sortOrder} />
                </th>
                <th className={thClass} onClick={() => handleSort('category')}>
                  カテゴリ
                  <SortIndicator active={sortKey === 'category'} order={sortOrder} />
                </th>
                <th
                  className={`${thClass} text-right`}
                  onClick={() => handleSort('price')}
                >
                  価格
                  <SortIndicator active={sortKey === 'price'} order={sortOrder} />
                </th>
                <th className="px-5 py-3 text-center">ステータス</th>
                <th className={thClass} onClick={() => handleSort('createdAt')}>
                  登録日
                  <SortIndicator active={sortKey === 'createdAt'} order={sortOrder} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setModalProduct(p)}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                    {p.productCode}
                  </td>
                  <td className="px-5 py-3.5">
                    {p.imageUrl ? (
                      <img
                        src={`${API_BASE}${p.imageUrl}`}
                        alt={p.name}
                        className="h-10 w-10 rounded-md border border-gray-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 bg-gray-50 text-gray-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-gray-900">{p.name}</td>
                  <td className="px-5 py-3.5 text-gray-600">{p.category}</td>
                  <td className="px-5 py-3.5 text-right text-gray-600">
                    {p.price.toLocaleString()}円
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleActive(p);
                      }}
                      title={p.isActive ? '無効にする' : '有効にする'}
                    >
                      <StatusBadge active={p.isActive} />
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString('ja-JP')}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-400">
                    {search
                      ? '検索条件に一致する商品はありません'
                      : '登録されている商品はありません'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalProduct !== null && (
        <ProductFormModal
          product={modalProduct === 'new' ? null : modalProduct}
          onClose={() => setModalProduct(null)}
          onSaved={() => {
            setModalProduct(null);
            load();
          }}
        />
      )}
    </div>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type FlowerProduct,
  type CreateProductPayload,
  createProduct,
  updateProduct,
  uploadProductImage,
} from '../api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100';

const CATEGORIES = [
  'バラ',
  'チューリップ',
  'ガーベラ',
  'ドライフラワー',
  'ハーバリウム',
  'カーネーション',
  'ひまわり',
  'ユリ',
  'その他',
] as const;

interface Props {
  product: FlowerProduct | null;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductFormModal({ product, onClose, onSaved }: Props) {
  const isEdit = !!product;
  const [productCode, setProductCode] = useState(product?.productCode ?? '');
  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState(product?.category ?? CATEGORIES[0]);
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.imageUrl ? `${API_BASE}${product.imageUrl}` : null,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      let saved: FlowerProduct;
      if (isEdit) {
        saved = await updateProduct(product.id, {
          name,
          category,
          price: parseInt(price, 10),
          description: description || undefined,
        });
      } else {
        const payload: CreateProductPayload = {
          productCode,
          name,
          category,
          price: parseInt(price, 10),
          description: description || undefined,
        };
        saved = await createProduct(payload);
      }

      if (imageFile) {
        await uploadProductImage(saved.id, imageFile);
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const inputClass =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]/30';

  return (
    <div className="modal-overlay flex items-center justify-center p-4" onClick={onClose}>
      <div className="modal-panel w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            {isEdit ? '商品編集' : '商品新規登録'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition-colors hover:text-gray-600"
            aria-label="閉じる"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              商品コード <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isEdit}
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              placeholder="FP-006"
              className={`${inputClass} ${isEdit ? 'bg-gray-100 text-gray-500' : ''}`}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              商品名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ミニブーケ（バラ）"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                カテゴリ <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                価格（円） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="1500"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              説明文
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="商品の説明を入力..."
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              商品画像
            </label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="プレビュー"
                  className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                {imagePreview ? '画像を変更' : '画像を選択'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#ffc000] px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-[#e6ad00] disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  createQrToken,
  fetchQrTokens,
  type QrTokenListItem,
  type CreateTokenResult,
} from '../api';
import { fetchMembers, type MemberSummary } from '../../members/api';
import { ApiClientError } from '../../../lib/api-client';

const WEB_BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:3000';

function TokenStatusBadge({ token }: { token: QrTokenListItem }) {
  const now = new Date();
  const expired = new Date(token.expiresAt) < now;

  if (expired) {
    return (
      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
        期限切れ
      </span>
    );
  }
  if (token.isUsed) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        使用済み（{token._count.thanksCards}件）
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
      未使用
    </span>
  );
}

export function QrTokenManagement() {
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [tokens, setTokens] = useState<QrTokenListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [memberId, setMemberId] = useState('');
  const [storyText, setStoryText] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [created, setCreated] = useState<CreateTokenResult | null>(null);

  const loadData = async () => {
    try {
      const [m, t] = await Promise.all([fetchMembers(), fetchQrTokens()]);
      setMembers(m);
      setTokens(t);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!memberId || !storyText.trim()) {
      setFormError('メンバーとストーリーテキストは必須です');
      return;
    }
    setCreating(true);
    setFormError('');
    try {
      const result = await createQrToken({ memberId, storyText: storyText.trim() });
      setCreated(result);
      setMemberId('');
      setStoryText('');
      loadData();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setFormError(err.message);
      } else {
        setFormError('エラーが発生しました');
      }
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-amber-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">QRトークン管理</h1>
        <p className="mt-1 text-sm text-gray-500">
          花ギフトに貼付するQRコードを生成します
        </p>
      </div>

      {/* Create form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          新しいQRトークンを生成
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              メンバー
            </label>
            <select
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            >
              <option value="">選択してください</option>
              {members
                .filter((m) => m.status === 'active')
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.user.name}（{m.site.name}）
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              ストーリーテキスト
            </label>
            <textarea
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              rows={4}
              placeholder="この花がどのように作られたか、メンバーの想いなどを記入してください"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            />
          </div>

          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}

          <button
            onClick={handleCreate}
            disabled={creating}
            className="rounded-lg bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-amber-600 disabled:opacity-50"
          >
            {creating ? '生成中...' : 'QRコードを生成'}
          </button>
        </div>
      </div>

      {/* Created token result */}
      {created && (
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-amber-800">
            QRコードが生成されました
          </h3>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="rounded-lg bg-white p-3">
              <QRCodeSVG
                value={`${WEB_BASE_URL}/qr/${created.token}`}
                size={180}
              />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">URL:</span>{' '}
                <code className="break-all rounded bg-white px-2 py-0.5 text-xs">
                  {WEB_BASE_URL}/qr/{created.token}
                </code>
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">有効期限:</span>{' '}
                {new Date(created.expiresAt).toLocaleDateString('ja-JP')}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${WEB_BASE_URL}/qr/${created.token}`,
                  );
                }}
                className="mt-2 rounded-lg border border-amber-300 bg-white px-4 py-1.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-50"
              >
                URLをコピー
              </button>
            </div>
          </div>
          <button
            onClick={() => setCreated(null)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            閉じる
          </button>
        </div>
      )}

      {/* Token list */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          トークン一覧
        </h2>
        {tokens.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            まだQRトークンがありません
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    メンバー
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    拠点
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    ステータス
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    作成日
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    有効期限
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {tokens.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {t.memberDisplayName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {t.siteName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <TokenStatusBadge token={t} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {new Date(t.createdAt).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {new Date(t.expiresAt).toLocaleDateString('ja-JP')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

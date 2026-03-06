'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import {
  type CharacteristicProfileData,
  fetchCharacteristicProfile,
  upsertCharacteristicProfile,
} from '../api';
import { RadarChart } from './radar-chart';

const SCORE_FIELDS = [
  { key: 'visualCognition', label: '視覚認知力' },
  { key: 'auditoryCognition', label: '聴覚認知力' },
  { key: 'dexterity', label: '手先の器用さ' },
  { key: 'physicalEndurance', label: '体力・持久力' },
  { key: 'repetitiveWorkTolerance', label: '反復作業耐性' },
  { key: 'adaptability', label: '変化対応力' },
  { key: 'interpersonalCommunication', label: '対人コミュニケーション' },
  { key: 'stressTolerance', label: 'ストレス耐性' },
] as const;

const TEXT_FIELDS = [
  { key: 'specialNotes', label: '特記事項（感覚過敏、こだわり、得意パターン等）' },
  { key: 'clinicSchedule', label: '通院スケジュール' },
  { key: 'medicationTiming', label: '服薬タイミング' },
  { key: 'environmentAccommodation', label: '環境配慮（騒音、照明、温度等）' },
  { key: 'communicationAccommodation', label: 'コミュニケーション配慮' },
] as const;

type ScoreKey = (typeof SCORE_FIELDS)[number]['key'];
type TextKey = (typeof TEXT_FIELDS)[number]['key'];

interface Props {
  memberId: string;
  readonly?: boolean;
}

export function CharacteristicProfileCard({ memberId, readonly = false }: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState<CharacteristicProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Edit state
  const [editScores, setEditScores] = useState<Record<ScoreKey, number | null>>({
    visualCognition: null,
    auditoryCognition: null,
    dexterity: null,
    physicalEndurance: null,
    repetitiveWorkTolerance: null,
    adaptability: null,
    interpersonalCommunication: null,
    stressTolerance: null,
  });
  const [editConcentration, setEditConcentration] = useState('');
  const [editTexts, setEditTexts] = useState<Record<TextKey, string>>({
    specialNotes: '',
    clinicSchedule: '',
    medicationTiming: '',
    environmentAccommodation: '',
    communicationAccommodation: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchCharacteristicProfile(memberId);
      setProfile(data);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
        return;
      }
      setError('特性プロファイルの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [memberId, router]);

  useEffect(() => {
    load();
  }, [load]);

  const startEdit = () => {
    const scores: Record<ScoreKey, number | null> = {
      visualCognition: null,
      auditoryCognition: null,
      dexterity: null,
      physicalEndurance: null,
      repetitiveWorkTolerance: null,
      adaptability: null,
      interpersonalCommunication: null,
      stressTolerance: null,
    };
    const texts: Record<TextKey, string> = {
      specialNotes: '',
      clinicSchedule: '',
      medicationTiming: '',
      environmentAccommodation: '',
      communicationAccommodation: '',
    };

    if (profile) {
      for (const { key } of SCORE_FIELDS) {
        scores[key] = profile[key];
      }
      setEditConcentration(
        profile.concentrationDuration != null
          ? String(profile.concentrationDuration)
          : '',
      );
      for (const { key } of TEXT_FIELDS) {
        texts[key] = profile[key] ?? '';
      }
    } else {
      setEditConcentration('');
    }

    setEditScores(scores);
    setEditTexts(texts);
    setIsEditing(true);
    setSaveError('');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      const concentration = editConcentration.trim();
      await upsertCharacteristicProfile(memberId, {
        ...editScores,
        concentrationDuration: concentration ? parseInt(concentration, 10) : null,
        ...editTexts,
      });
      setIsEditing(false);
      await load();
    } catch (err) {
      setSaveError(
        err instanceof ApiClientError ? err.message : '保存に失敗しました。',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-xl bg-gray-100" />;
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">特性プロファイル</h2>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const radarScores: Record<string, number | null> = profile
    ? {
        visualCognition: profile.visualCognition,
        auditoryCognition: profile.auditoryCognition,
        dexterity: profile.dexterity,
        physicalEndurance: profile.physicalEndurance,
        repetitiveWorkTolerance: profile.repetitiveWorkTolerance,
        adaptability: profile.adaptability,
        interpersonalCommunication: profile.interpersonalCommunication,
        concentrationDuration: profile.concentrationDuration,
        stressTolerance: profile.stressTolerance,
      }
    : {};

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">特性プロファイル</h2>
        {!readonly && !isEditing && (
          <button
            onClick={startEdit}
            className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {profile ? '編集' : '登録'}
          </button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-lg bg-[#ffc000] px-4 py-1.5 text-sm font-semibold text-gray-900 hover:bg-[#e6ad00] disabled:opacity-50"
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        )}
      </div>

      {saveError && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      {isEditing ? (
        <div className="space-y-6">
          {/* Score fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">特性スコア（1-5）</h3>
            {SCORE_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="mb-1.5 block text-xs font-medium text-gray-500">
                  {label}
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() =>
                        setEditScores((prev) => ({
                          ...prev,
                          [key]: prev[key] === v ? null : v,
                        }))
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                        editScores[key] === v
                          ? 'border-[#ffc000] bg-[#ffc000] font-bold text-gray-900'
                          : 'border-gray-200 text-gray-400 hover:border-gray-300'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* concentrationDuration */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                集中持続時間（分）
              </label>
              <input
                type="number"
                min="0"
                value={editConcentration}
                onChange={(e) => setEditConcentration(e.target.value)}
                placeholder="例: 90"
                className="block w-32 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]/30"
              />
            </div>
          </div>

          {/* Text fields */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">配慮事項</h3>
            {TEXT_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="mb-1 block text-xs font-medium text-gray-500">
                  {label}
                </label>
                <textarea
                  value={editTexts[key]}
                  onChange={(e) =>
                    setEditTexts((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  rows={2}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-[#ffc000] focus:outline-none focus:ring-1 focus:ring-[#ffc000]/30"
                />
              </div>
            ))}
          </div>
        </div>
      ) : profile ? (
        <div>
          <RadarChart scores={radarScores} />

          <div className="mt-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">配慮事項</h3>
            <dl className="grid grid-cols-1 gap-3">
              {TEXT_FIELDS.map(({ key, label }) => (
                <div key={key}>
                  <dt className="text-xs font-medium text-gray-500">{label}</dt>
                  <dd className="mt-0.5 text-sm text-gray-900">
                    {profile[key] || '—'}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      ) : (
        <p className="py-4 text-center text-sm text-gray-400">
          特性プロファイルはまだ登録されていません
        </p>
      )}
    </div>
  );
}

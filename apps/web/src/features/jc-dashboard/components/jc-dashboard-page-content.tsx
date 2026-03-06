'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  fetchTeamOverview,
  fetchAlerts,
  type TeamMemberOverview,
  type AlertMember,
} from '../api';
import { ConditionHeatmap } from './condition-heatmap';
import { AlertList } from './alert-list';
import { ManualAlertModal } from './manual-alert-modal';
import { ProductionProgressTab } from './production-progress';
import { AssessmentOverviewTab } from './assessment-overview';

type Tab = 'condition' | 'alerts' | 'production' | 'assessment';

export function JCDashboardPageContent() {
  const [activeTab, setActiveTab] = useState<Tab>('condition');
  const [members, setMembers] = useState<TeamMemberOverview[]>([]);
  const [alerts, setAlerts] = useState<AlertMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalMember, setModalMember] = useState<TeamMemberOverview | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [teamData, alertData] = await Promise.all([
        fetchTeamOverview(),
        fetchAlerts(),
      ]);
      setMembers(teamData);
      setAlerts(alertData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAlertSuccess = () => {
    setModalMember(null);
    loadData();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
        <div className="grid grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button
          onClick={loadData}
          className="mt-3 text-sm font-medium text-red-600 hover:text-red-800"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with date */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            コンディション管理
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {new Date().toLocaleDateString('ja-JP', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'short',
            })}
          </p>
        </div>
        <button
          onClick={loadData}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          更新
        </button>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab('condition')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
            activeTab === 'condition'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          コンディション
          <span className="ml-1 text-xs text-gray-400">
            ({members.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
            activeTab === 'alerts'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          アラート
          {alerts.length > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
              {alerts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('production')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
            activeTab === 'production'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          生産進捗
        </button>
        <button
          onClick={() => setActiveTab('assessment')}
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
            activeTab === 'assessment'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          アセスメント
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'condition' && (
        <ConditionHeatmap
          members={members}
          onMemberClick={(m) => setModalMember(m)}
        />
      )}
      {activeTab === 'alerts' && (
        <AlertList
          alerts={alerts}
          onSetManualAlert={(m) => setModalMember(m)}
        />
      )}
      {activeTab === 'production' && <ProductionProgressTab />}
      {activeTab === 'assessment' && <AssessmentOverviewTab />}

      {/* Manual alert modal */}
      {modalMember && (
        <ManualAlertModal
          member={modalMember}
          onClose={() => setModalMember(null)}
          onSuccess={handleAlertSuccess}
        />
      )}
    </div>
  );
}

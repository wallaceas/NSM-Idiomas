import React, { useEffect, useState } from 'react';
import { fetchStudentDashboard } from '../services/dashboardService';
import { DashboardData } from '../types/dashboard.types';
import { ResumeCard } from '../components/dashboard/ResumeCard';
import { DueFlashcardsCard } from '../components/dashboard/DueFlashcardsCard';
import { LevelProgressGrid } from '../components/dashboard/LevelProgressGrid';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    fetchStudentDashboard()
      .then((payload) => {
        if (active) setData(payload);
      })
      .catch(() => {
        if (active) setError('Não foi possível carregar o painel do aluno.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto p-6 mt-10 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        {error ?? 'Dados indisponíveis.'}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Painel de Estudos</h1>
          <p className="text-sm text-gray-600">
            Progresso geral da trilha: <strong className="text-indigo-700">{data.overallCompletionPercentage}%</strong>
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResumeCard
          item={data.resumeContent}
          firstLevelCode={data.levels[0]?.code ?? 'A1'}
        />
        <DueFlashcardsCard dueCount={data.dueFlashcardsCount} />
      </div>

      <LevelProgressGrid levels={data.levels} />
    </div>
  );
};
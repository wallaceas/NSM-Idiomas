import React from 'react';
import { Link } from 'react-router-dom';
import { CefrCode, LevelProgress } from '../../types/dashboard.types';

const CEFR_ORDER: CefrCode[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

interface LevelProgressGridProps {
  levels: LevelProgress[];
}

export const LevelProgressGrid: React.FC<LevelProgressGridProps> = ({ levels }) => {
  const sortedLevels = [...levels].sort(
    (a, b) => CEFR_ORDER.indexOf(a.code) - CEFR_ORDER.indexOf(b.code)
  );

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Progresso por nível (A1 a C2)</h2>
        <span className="text-xs text-gray-500">Baseado em lições, e-books, histórias e exercícios</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedLevels.map((lvl) => (
          <Link
            key={lvl.levelId}
            to={`/levels/${lvl.code}`}
            className="bg-white border rounded-2xl p-5 shadow-sm hover:border-indigo-400 transition block"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm">
                {lvl.code}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {lvl.completionPercentage}%
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 mt-3">{lvl.title}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {lvl.completedContents} de {lvl.totalContents} conteúdos concluídos
            </p>

            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-3">
              <div
                className="h-full bg-indigo-600 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, lvl.completionPercentage))}%` }}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};
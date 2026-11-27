import React from 'react';
import { Link } from 'react-router-dom';
import { Play, BookOpen, BookMarked, CheckSquare } from 'lucide-react';
import { ContentKind, ResumeContent } from '../../types/dashboard.types';

interface ResumeCardProps {
  item: ResumeContent | null;
  firstLevelCode?: string;
}

function buildStudyRoute(item: ResumeContent): string {
  const query = item.lastPosition ? `?pos=${encodeURIComponent(item.lastPosition)}` : '';
  switch (item.type) {
    case 'VIDEO':
      return `/study/video/${item.contentId}${query}`;
    case 'EBOOK':
      return `/study/ebook/${item.contentId}${query}`;
    case 'SHORT_STORY':
      return `/study/story/${item.contentId}${query}`;
    case 'EXERCISE':
      return `/study/exercise/${item.contentId}`;
  }
}

function formatPositionLabel(type: ContentKind, lastPosition: string | null, percentage: number): string {
  if (type === 'VIDEO' && lastPosition) {
    const totalSeconds = Math.max(0, Number(lastPosition) || 0);
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `Parou em ${mins}:${String(secs).padStart(2, '0')} (${percentage}%)`;
  }
  return `${percentage}% concluído`;
}

function TypeIcon({ type }: { type: ContentKind }) {
  switch (type) {
    case 'VIDEO':
      return <Play className="w-5 h-5 text-indigo-600" />;
    case 'EBOOK':
      return <BookOpen className="w-5 h-5 text-indigo-600" />;
    case 'SHORT_STORY':
      return <BookMarked className="w-5 h-5 text-indigo-600" />;
    case 'EXERCISE':
      return <CheckSquare className="w-5 h-5 text-indigo-600" />;
  }
}

export const ResumeCard: React.FC<ResumeCardProps> = ({ item, firstLevelCode = 'A1' }) => {
  if (!item) {
    return (
      <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Retomada rápida
          </span>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            Comece sua primeira lição
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Você ainda não iniciou nenhum conteúdo. Abra o nível {firstLevelCode} para começar.
          </p>
        </div>
        <Link
          to={`/levels/${firstLevelCode}`}
          className="mt-5 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
        >
          Explorar nível {firstLevelCode}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Continuar de onde parou
          </span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
            Nível {item.levelCode}
          </span>
        </div>

        <div className="flex items-start gap-3 mt-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 shrink-0 mt-0.5">
            <TypeIcon type={item.type} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{item.title}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {formatPositionLabel(item.type, item.lastPosition, item.percentage)}
            </p>
          </div>
        </div>

        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mt-4">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
          />
        </div>
      </div>

      <Link
        to={buildStudyRoute(item)}
        className="mt-5 inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
      >
        Retomar agora
      </Link>
    </div>
  );
};
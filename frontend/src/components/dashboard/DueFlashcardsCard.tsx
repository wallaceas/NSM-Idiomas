import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';

interface DueFlashcardsCardProps {
  dueCount: number;
}

export const DueFlashcardsCard: React.FC<DueFlashcardsCardProps> = ({ dueCount }) => {
  const hasDue = dueCount > 0;

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
            Repetição espaçada (SM-2)
          </span>
          <Layers className="w-5 h-5 text-amber-600" />
        </div>

        <p className="text-4xl font-extrabold text-gray-900 mt-3">{dueCount}</p>
        <p className="text-sm text-gray-600 mt-1">
          {hasDue
            ? 'Flashcards pendentes de revisão para fixar o vocabulário.'
            : 'Nenhuma revisão pendente no momento. Bom trabalho!'}
        </p>
      </div>

      <Link
        to="/reviews"
        className={`mt-5 inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
          hasDue
            ? 'bg-amber-500 text-white hover:bg-amber-600'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {hasDue ? 'Iniciar revisão agora' : 'Ver deck de flashcards'}
      </Link>
    </div>
  );
};
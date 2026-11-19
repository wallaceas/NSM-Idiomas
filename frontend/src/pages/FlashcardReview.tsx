import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  interval: number;
}

export const FlashcardReview: React.FC = () => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDueCards();
  }, []);

  const fetchDueCards = async () => {
    try {
      const { data } = await api.get('/flashcards/due');
      setCards(data);
    } catch (error) {
      console.error("Erro ao carregar flashcards", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewResponse = async (quality: number) => {
    const currentCard = cards[currentIndex];
    
    await api.post(`/flashcards/${currentCard.id}/review`, { quality });

    setIsFlipped(false);
    setCurrentIndex((prev) => prev + 1);
  };

  if (loading) return <div className="p-8 text-center">Carregando revisões...</div>;

  if (cards.length === 0 || currentIndex >= cards.length) {
    return (
      <div className="p-8 text-center bg-green-50 rounded-lg max-w-md mx-auto mt-12 shadow-sm">
        <h2 className="text-2xl font-bold text-green-800 mb-2">Parabéns! 🎉</h2>
        <p className="text-green-600">Você concluiu todas as revisões agendadas para hoje.</p>
      </div>
    );
  }

  const card = cards[currentIndex];

  return (
    <div className="max-w-xl mx-auto p-6 mt-8">
      <div className="flex justify-between mb-4 text-sm text-gray-500 font-medium">
        <span>Cartão {currentIndex + 1} de {cards.length}</span>
        <span>Revisão Espaçada (SM-2)</span>
      </div>

      {/* Cartão Interativo */}
      <div 
        onClick={() => setIsFlipped(!isFlipped)}
        className="min-h-[280px] bg-white border-2 border-indigo-100 rounded-2xl shadow-md p-8 flex flex-col justify-center items-center cursor-pointer transition-all hover:shadow-lg text-center"
      >
        <span className="text-xs uppercase tracking-wider text-indigo-500 font-semibold mb-2">
          {isFlipped ? "Verso (Significado / Contexto)" : "Frente (Trecho do E-book)"}
        </span>
        <p className="text-xl font-medium text-gray-800 my-4">
          {isFlipped ? card.back : card.front}
        </p>
        <span className="text-xs text-gray-400 mt-4">Clique no cartão para {isFlipped ? "ver a frente" : "virar"}</span>
      </div>

      {/* Botões de Avaliação (Aparecem apenas após virar o cartão) */}
      {isFlipped && (
        <div className="grid grid-cols-4 gap-3 mt-6">
          <button 
            onClick={() => handleReviewResponse(1)}
            className="bg-red-100 text-red-700 py-3 rounded-xl font-semibold hover:bg-red-200 transition"
          >
            Difícil (1)
          </button>
          <button 
            onClick={() => handleReviewResponse(3)}
            className="bg-yellow-100 text-yellow-700 py-3 rounded-xl font-semibold hover:bg-yellow-200 transition"
          >
            Bom (3)
          </button>
          <button 
            onClick={() => handleReviewResponse(4)}
            className="bg-blue-100 text-blue-700 py-3 rounded-xl font-semibold hover:bg-blue-200 transition"
          >
            Fácil (4)
          </button>
          <button 
            onClick={() => handleReviewResponse(5)}
            className="bg-green-100 text-green-700 py-3 rounded-xl font-semibold hover:bg-green-200 transition"
          >
            Perfeito (5)
          </button>
        </div>
      )}
    </div>
  );
};
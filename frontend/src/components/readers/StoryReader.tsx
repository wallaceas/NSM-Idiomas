import React, { useState } from 'react';
import { api } from '../../services/api';

interface Paragraph {
  order: number;
  targetText: string;
  nativeTranslation: string;
}

interface LookupResult {
  word: string;
  translationAndNote: string;
  frontSuggestion: string;
}

interface StoryReaderProps {
  contentId: string;
  title: string;
  paragraphs: Paragraph[];
  initialParagraphIndex?: number;
}

export const StoryReader: React.FC<StoryReaderProps> = ({
  contentId,
  title,
  paragraphs,
  initialParagraphIndex = 0
}) => {
  const [activeParagraph, setActiveParagraph] = useState<number>(initialParagraphIndex);
  const [showAllTranslations, setShowAllTranslations] = useState<boolean>(false);
  const [revealedParagraphs, setRevealedParagraphs] = useState<Record<number, boolean>>({});
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [lookupData, setLookupData] = useState<LookupResult | null>(null);
  const [loadingLookup, setLoadingLookup] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const handleWordClick = async (rawToken: string, sentence: string, paragraphIndex: number) => {
    const cleanWord = rawToken.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
    if (!cleanWord) return;

    setActiveParagraph(paragraphIndex);
    setSelectedWord(cleanWord);
    setLookupData(null);
    setSavedNotice(null);
    setLoadingLookup(true);

    // Salva progresso aproximado por parágrafo
    const percentage = Math.round(((paragraphIndex + 1) / paragraphs.length) * 100);
    api.post('/progress/sync', {
      contentId,
      lastPosition: String(paragraphIndex),
      percentage
    }).catch(() => {});

    try {
      const { data } = await api.post('/dictionary/lookup', {
        word: cleanWord,
        contextSentence: sentence
      });
      setLookupData(data);
    } catch (err) {
      console.error('Erro ao consultar palavra:', err);
    } finally {
      setLoadingLookup(false);
    }
  };

  const handleSaveFlashcard = async () => {
    if (!lookupData) return;
    await api.post('/dictionary/save-flashcard', {
      front: lookupData.frontSuggestion,
      back: lookupData.translationAndNote
    });
    setSavedNotice(`"${lookupData.frontSuggestion}" adicionado aos flashcards.`);
  };

  const toggleParagraphTranslation = (order: number) => {
    setRevealedParagraphs((prev) => ({ ...prev, [order]: !prev[order] }));
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Coluna da História */}
      <div className="lg:col-span-2 bg-white border rounded-xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <button
            onClick={() => setShowAllTranslations((prev) => !prev)}
            className="text-sm px-3 py-1.5 rounded-lg border bg-gray-50 hover:bg-gray-100"
          >
            {showAllTranslations ? 'Ocultar traduções' : 'Mostrar todas traduções'}
          </button>
        </div>

        {paragraphs.map((p, idx) => {
          const tokens = p.targetText.split(/(\s+)/);
          const isTranslationVisible = showAllTranslations || !!revealedParagraphs[p.order];

          return (
            <div
              key={p.order}
              className={`p-3 rounded-lg transition ${
                activeParagraph === idx ? 'bg-indigo-50/40' : ''
              }`}
            >
              <p className="text-lg leading-8 text-gray-800">
                {tokens.map((token, tIdx) => {
                  const isWord = /[\p{L}]/u.test(token);
                  const clean = token.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
                  const isSelected = selectedWord && clean.toLowerCase() === selectedWord.toLowerCase();

                  if (!isWord) {
                    return <React.Fragment key={tIdx}>{token}</React.Fragment>;
                  }

                  return (
                    <button
                      key={tIdx}
                      type="button"
                      onClick={() => handleWordClick(token, p.targetText, idx)}
                      className={`inline rounded px-0.5 cursor-pointer transition ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-semibold'
                          : 'hover:bg-amber-200/80'
                      }`}
                    >
                      {token}
                    </button>
                  );
                })}
              </p>

              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => toggleParagraphTranslation(p.order)}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  {isTranslationVisible ? 'Esconder tradução do parágrafo' : 'Ver tradução do parágrafo'}
                </button>
                {isTranslationVisible && (
                  <p className="mt-1 text-sm text-gray-600 italic border-l-2 border-indigo-300 pl-3">
                    {p.nativeTranslation}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel Lateral de Tradução por Clique */}
      <aside className="bg-gray-50 border rounded-xl p-5 h-fit sticky top-6">
        <h2 className="font-bold text-gray-900 mb-3">Dicionário & Vocabulário</h2>

        {!selectedWord && (
          <p className="text-sm text-gray-500">
            Clique em qualquer palavra da história para ver a tradução no contexto e salvar como flashcard.
          </p>
        )}

        {selectedWord && loadingLookup && (
          <p className="text-sm text-indigo-600">Consultando "{selectedWord}"...</p>
        )}

        {lookupData && !loadingLookup && (
          <div className="space-y-4">
            <div>
              <span className="text-xs uppercase text-gray-400 font-semibold">Palavra selecionada</span>
              <p className="text-xl font-bold text-indigo-700">{lookupData.word}</p>
            </div>

            <div className="text-sm text-gray-700 whitespace-pre-line bg-white p-3 rounded-lg border">
              {lookupData.translationAndNote}
            </div>

            <button
              type="button"
              onClick={handleSaveFlashcard}
              className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              + Salvar nos Flashcards
            </button>

            {savedNotice && (
              <p className="text-xs text-green-700 bg-green-100 p-2 rounded-lg font-medium">
                {savedNotice}
              </p>
            )}
          </div>
        )}
      </aside>
    </div>
  );
};
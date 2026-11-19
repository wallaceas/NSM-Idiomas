import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

interface Question {
  id: string;
  type: 'MULTIPLE_CHOICE' | 'FILL_IN_THE_BLANK';
  prompt: string;
  options?: string[];
}

interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  correctAnswer: any;
  explanation?: string;
}

export const QuizEngine: React.FC<{ contentId: string }> = ({ contentId }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submissionResult, setSubmissionResult] = useState<{
    scorePercentage: number;
    passed: boolean;
    results: QuestionResult[];
  } | null>(null);

  useEffect(() => {
    api.get(`/exercises/${contentId}`).then((res) => setQuestions(res.data));
  }, [contentId]);

  const handleSelectAnswer = (questionId: string, value: string) => {
    if (submissionResult) return; // Bloqueia edição após envio
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    const { data } = await api.post(`/exercises/${contentId}/submit`, { answers });
    setSubmissionResult(data);
  };

  // Renderiza frase substituindo "___" por um input inline
  const renderFillInTheBlank = (q: Question) => {
    const parts = q.prompt.split('___');
    return (
      <div className="text-lg leading-relaxed">
        {parts[0]}
        <input
          type="text"
          disabled={!!submissionResult}
          value={answers[q.id] || ''}
          onChange={(e) => handleSelectAnswer(q.id, e.target.value)}
          placeholder="digite aqui..."
          className="mx-2 px-3 py-1 border-b-2 border-indigo-500 bg-indigo-50/50 rounded focus:outline-none text-center font-semibold w-40"
        />
        {parts[1]}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6 bg-white rounded-xl shadow-sm border">
      {questions.map((q, index) => {
        const feedback = submissionResult?.results.find((r) => r.questionId === q.id);

        return (
          <div key={q.id} className="p-4 border rounded-lg bg-gray-50/50">
            <span className="text-xs font-bold text-indigo-600 uppercase">
              Questão {index + 1}
            </span>

            <div className="mt-2">
              {q.type === 'FILL_IN_THE_BLANK' ? (
                renderFillInTheBlank(q)
              ) : (
                <>
                  <p className="text-lg font-medium mb-3">{q.prompt}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options?.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleSelectAnswer(q.id, option)}
                        className={`p-3 text-left rounded-lg border transition ${
                          answers[q.id] === option
                            ? 'border-indigo-600 bg-indigo-50 font-semibold'
                            : 'bg-white hover:bg-gray-100'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Feedback imediato após correção */}
            {feedback && (
              <div
                className={`mt-3 p-3 rounded-lg text-sm ${
                  feedback.isCorrect
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <p className="font-bold">
                  {feedback.isCorrect
                    ? '✓ Resposta correta!'
                    : `✗ Incorreto. Resposta esperada: ${
                        Array.isArray(feedback.correctAnswer)
                          ? feedback.correctAnswer.join(' / ')
                          : feedback.correctAnswer
                      }`}
                </p>
                {feedback.explanation && <p className="mt-1">{feedback.explanation}</p>}
              </div>
            )}
          </div>
        );
      })}

      {!submissionResult ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50"
        >
          Finalizar e Corrigir Exercícios
        </button>
      ) : (
        <div className="p-4 bg-indigo-900 text-white rounded-xl text-center">
          <p className="text-xl font-bold">Pontuação: {submissionResult.scorePercentage}%</p>
          <p className="text-sm opacity-90 mt-1">
            {submissionResult.passed
              ? 'Lição concluída com sucesso e salva no seu progresso!'
              : 'Você precisa de pelo menos 70% para concluir esta lição. Tente novamente!'}
          </p>
        </div>
      )}
    </div>
  );
};
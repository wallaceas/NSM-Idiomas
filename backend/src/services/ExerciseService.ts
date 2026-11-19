import { AppDataSource } from '../config/data-source';
import { Question, QuestionType } from '../entities/Question';
import { UserExerciseAttempt } from '../entities/UserExerciseAttempt';
import { ProgressService } from './ProgressService';

export class ExerciseService {
  private questionRepo = AppDataSource.getRepository(Question);
  private attemptRepo = AppDataSource.getRepository(UserExerciseAttempt);
  private progressService = new ProgressService();

  // 1. Entrega questões limpas (sem gabarito) para o Frontend
  async getQuestionsForStudent(contentId: string) {
    const questions = await this.questionRepo.find({
      where: { content: { id: contentId } },
      order: { orderIndex: 'ASC' }
    });

    return questions.map(({ correctAnswer, explanation, ...safeQuestion }) => safeQuestion);
  }

  // 2. Corrige as respostas e grava o progresso no banco
  async submitAndGrade(userId: string, contentId: string, answers: Record<string, any>) {
    const questions = await this.questionRepo.find({
      where: { content: { id: contentId } }
    });

    let correctCount = 0;
    const detailedResults = questions.map((q) => {
      const userAnswer = answers[q.id];
      const isCorrect = this.evaluateAnswer(q, userAnswer);

      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        isCorrect,
        userAnswer,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation
      };
    });

    const scorePercentage = questions.length > 0 
      ? Math.round((correctCount / questions.length) * 100) 
      : 0;

    // Salva histórico da tentativa
    const attempt = this.attemptRepo.create({
      user: { id: userId },
      content: { id: contentId },
      scorePercentage,
      submittedAnswers: answers
    });
    await this.attemptRepo.save(attempt);

    // Atualiza progresso geral da lição (considera concluído se acertar >= 70%)
    if (scorePercentage >= 70) {
      await this.progressService.syncProgress(userId, contentId, 'COMPLETED', 100);
    }

    return {
      scorePercentage,
      passed: scorePercentage >= 70,
      results: detailedResults
    };
  }

  private evaluateAnswer(question: Question, userAnswer: any): boolean {
    if (userAnswer === undefined || userAnswer === null) return false;

    switch (question.type) {
      case QuestionType.MULTIPLE_CHOICE:
        return String(userAnswer).trim() === String(question.correctAnswer).trim();

      case QuestionType.FILL_IN_THE_BLANK:
        // Aceita múltiplas respostas válidas (ex: ["don't", "do not"]) e ignora case/espaços extras
        const normalize = (str: string) => str.trim().toLowerCase().replace(/\s+/g, ' ');
        const normalizedUser = normalize(String(userAnswer));

        if (Array.isArray(question.correctAnswer)) {
          return question.correctAnswer.some((valid) => normalize(valid) === normalizedUser);
        }
        return normalize(String(question.correctAnswer)) === normalizedUser;

      case QuestionType.SENTENCE_ORDER:
        return JSON.stringify(userAnswer) === JSON.stringify(question.correctAnswer);

      default:
        return false;
    }
  }
}
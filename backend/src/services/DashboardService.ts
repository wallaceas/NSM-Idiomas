import { LessThanOrEqual } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Level } from '../entities/Level';
import { Content } from '../entities/Content';
import { UserProgress } from '../entities/UserProgress';
import { Flashcard } from '../entities/Flashcard';

const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export class DashboardService {
  private levelRepo = AppDataSource.getRepository(Level);
  private contentRepo = AppDataSource.getRepository(Content);
  private progressRepo = AppDataSource.getRepository(UserProgress);
  private flashcardRepo = AppDataSource.getRepository(Flashcard);

  async getStudentDashboard(userId: string) {
    const levels = await this.levelRepo.find();
    levels.sort((a, b) => CEFR_ORDER.indexOf(a.code) - CEFR_ORDER.indexOf(b.code));

    // 1. Total de conteúdos por nível
    const totalRows = await this.contentRepo
      .createQueryBuilder('content')
      .select('content.levelId', 'levelId')
      .addSelect('COUNT(content.id)', 'total')
      .groupBy('content.levelId')
      .getRawMany<{ levelId: string; total: string }>();

    // 2. Conteúdos concluídos pelo aluno por nível
    const completedRows = await this.progressRepo
      .createQueryBuilder('progress')
      .innerJoin('progress.content', 'content')
      .select('content.levelId', 'levelId')
      .addSelect('COUNT(content.id)', 'completed')
      .where('progress.userId = :userId', { userId })
      .andWhere('progress.isCompleted = :isCompleted', { isCompleted: true })
      .groupBy('content.levelId')
      .getRawMany<{ levelId: string; completed: string }>();

    const totalByLevel = new Map<string, number>();
    for (const row of totalRows) {
      totalByLevel.set(row.levelId, Number(row.total) || 0);
    }

    const completedByLevel = new Map<string, number>();
    for (const row of completedRows) {
      completedByLevel.set(row.levelId, Number(row.completed) || 0);
    }

    let grandTotal = 0;
    let grandCompleted = 0;

    const levelSummaries = levels.map((lvl) => {
      const totalContents = totalByLevel.get(lvl.id) ?? 0;
      const completedContents = completedByLevel.get(lvl.id) ?? 0;

      grandTotal += totalContents;
      grandCompleted += completedContents;

      const completionPercentage =
        totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;

      return {
        levelId: lvl.id,
        code: lvl.code,
        title: lvl.title,
        totalContents,
        completedContents,
        completionPercentage,
      };
    });

    const overallCompletionPercentage =
      grandTotal > 0 ? Math.round((grandCompleted / grandTotal) * 100) : 0;

    // 3. Flashcards pendentes de revisão hoje (SM-2)
    const dueFlashcardsCount = await this.flashcardRepo.count({
      where: {
        user: { id: userId },
        nextReviewDate: LessThanOrEqual(new Date()),
      },
    });

    // 4. Último item para retomada rápida (prioriza item ainda não concluído)
    const resumeContent = await this.findResumeContent(userId);

    return {
      dueFlashcardsCount,
      overallCompletionPercentage,
      levels: levelSummaries,
      resumeContent,
    };
  }

  private async findResumeContent(userId: string) {
    let latest = await this.progressRepo.findOne({
      where: {
        user: { id: userId },
        isCompleted: false,
      },
      relations: ['content', 'content.level'],
      order: { updatedAt: 'DESC' },
    });

    if (!latest) {
      latest = await this.progressRepo.findOne({
        where: { user: { id: userId } },
        relations: ['content', 'content.level'],
        order: { updatedAt: 'DESC' },
      });
    }

    if (!latest || !latest.content) {
      return null;
    }

    return {
      contentId: latest.content.id,
      title: latest.content.title,
      levelCode: latest.content.level?.code ?? 'A1',
      type: latest.content.type,
      lastPosition: latest.lastPosition,
      percentage: Number(latest.percentage) || 0,
      updatedAt: latest.updatedAt.toISOString(),
    };
  }
}
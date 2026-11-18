import { AppDataSource } from '../config/data-source';
import { UserProgress } from '../entities/UserProgress';

export class ProgressService {
  private progressRepo = AppDataSource.getRepository(UserProgress);

  async syncProgress(userId: string, contentId: string, lastPosition: string, percentage: number) {
    let progress = await this.progressRepo.findOne({
      where: { user: { id: userId }, content: { id: contentId } }
    });

    const isCompleted = percentage >= 90; // Regra de negócio: 90%+ marca como concluído

    if (!progress) {
      progress = this.progressRepo.create({
        user: { id: userId },
        content: { id: contentId },
        lastPosition,
        percentage,
        isCompleted
      });
    } else {
      progress.lastPosition = lastPosition;
      progress.percentage = Math.max(Number(progress.percentage), percentage); // Não regride % concluída
      if (isCompleted) progress.isCompleted = true;
    }

    return await this.progressRepo.save(progress);
  }
}
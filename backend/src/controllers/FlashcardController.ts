import { Request, Response, NextFunction } from 'express';
import { LessThanOrEqual } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Flashcard } from '../entities/Flashcard';
import { SpacedRepetitionService } from '../services/SpacedRepetitionService';
import { reviewFlashcardSchema, validateBody } from '../validators/studyValidators';

export class FlashcardController {
  private flashcardRepo = AppDataSource.getRepository(Flashcard);
  private sm2Service = new SpacedRepetitionService();

  async listDue(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
      }

      const dueCards = await this.flashcardRepo.find({
        where: {
          user: { id: userId },
          nextReviewDate: LessThanOrEqual(new Date()),
        },
        order: { nextReviewDate: 'ASC' },
      });

      return res.json(dueCards);
    } catch (error) {
      return next(error);
    }
  }

  async review(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
      }

      const validation = validateBody(reviewFlashcardSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Payload inválido.', errors: validation.errors });
      }

      const { id } = req.params;
      const card = await this.flashcardRepo.findOne({
        where: { id, user: { id: userId } },
      });

      if (!card) {
        return res.status(404).json({ message: 'Flashcard não encontrado.' });
      }

      const updatedCard = this.sm2Service.calculateNextReview(card, validation.data.quality);
      const saved = await this.flashcardRepo.save(updatedCard);

      return res.json(saved);
    } catch (error) {
      return next(error);
    }
  }
}
import { Request, Response, NextFunction } from 'express';
import { ProgressService } from '../services/ProgressService';
import { syncProgressSchema, validateBody } from '../validators/studyValidators';

export class ProgressController {
  private progressService = new ProgressService();

  async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
      }

      const validation = validateBody(syncProgressSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Payload inválido.', errors: validation.errors });
      }

      const { contentId, lastPosition, percentage } = validation.data;
      const updated = await this.progressService.syncProgress(
        userId,
        contentId,
        lastPosition ?? '',
        percentage
      );

      return res.status(200).json(updated);
    } catch (error) {
      return next(error);
    }
  }
}
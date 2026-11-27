import { Request, Response, NextFunction } from 'express';
import { AppDataSource } from '../config/data-source';
import { EbookHighlight } from '../entities/EbookHighlight';
import { Flashcard } from '../entities/Flashcard';
import { AiFlashcardService } from '../services/AiFlashcardService';
import { createHighlightSchema, validateBody } from '../validators/studyValidators';

export class HighlightController {
  private highlightRepo = AppDataSource.getRepository(EbookHighlight);
  private flashcardRepo = AppDataSource.getRepository(Flashcard);
  private aiFlashcardService = new AiFlashcardService();

  async listByContent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
      }

      const { contentId } = req.params;
      const highlights = await this.highlightRepo.find({
        where: {
          user: { id: userId },
          content: { id: contentId },
        },
        order: { createdAt: 'ASC' },
      });

      return res.json(highlights);
    } catch (error) {
      return next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
      }

      const validation = validateBody(createHighlightSchema, req.body);
      if (!validation.success) {
        return res.status(400).json({ message: 'Payload inválido.', errors: validation.errors });
      }

      const { contentId, cfiRange, highlightedText, color, note, createFlashcard } = validation.data;

      const highlightEntity = this.highlightRepo.create({
        user: { id: userId },
        content: { id: contentId },
        cfiRange,
        highlightedText,
        color,
        note: note ?? undefined,
      });

      const savedHighlight = await this.highlightRepo.save(highlightEntity);

      let generatedFlashcard: Flashcard | null = null;
      if (createFlashcard) {
        try {
          const aiData = await this.aiFlashcardService.generateFlashcardContent(
            highlightedText,
            'en'
          );
          const card = this.flashcardRepo.create({
            user: { id: userId },
            highlight: { id: savedHighlight.id },
            front: aiData.front || highlightedText,
            back: aiData.back || note || highlightedText,
          });
          generatedFlashcard = await this.flashcardRepo.save(card);
        } catch (aiError) {
          console.error('Falha ao gerar flashcard automático do sublinhado:', aiError);
        }
      }

      return res.status(201).json({
        highlight: savedHighlight,
        flashcard: generatedFlashcard,
      });
    } catch (error) {
      return next(error);
    }
  }

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
      }

      const { id } = req.params;
      const existing = await this.highlightRepo.findOne({
        where: { id, user: { id: userId } },
      });

      if (!existing) {
        return res.status(404).json({ message: 'Sublinhado não encontrado.' });
      }

      await this.highlightRepo.remove(existing);
      return res.status(204).send();
    } catch (error) {
      return next(error);
    }
  }
}
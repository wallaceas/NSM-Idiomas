import { Request, Response } from 'express';
import { AiFlashcardService } from '../services/AiFlashcardService';
import { AppDataSource } from '../config/data-source';
import { Flashcard } from '../entities/Flashcard';

export class DictionaryController {
  private aiService = new AiFlashcardService();
  private flashcardRepo = AppDataSource.getRepository(Flashcard);

  // POST /api/dictionary/lookup
  async lookupWord(req: Request, res: Response) {
    const { word, contextSentence, targetLanguage = 'en' } = req.body;

    if (!word || typeof word !== 'string') {
      return res.status(400).json({ message: 'Palavra inválida.' });
    }

    const cleanWord = word.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '');
    if (!cleanWord) {
      return res.status(400).json({ message: 'Token sem letras.' });
    }

    // Reutiliza sua geração estruturada de tradução/contexto
    const info = await this.aiService.generateFlashcardContent(
      `${cleanWord} (contexto: "${contextSentence || ''}")`,
      targetLanguage
    );

    return res.json({
      word: cleanWord,
      translationAndNote: info.back,
      frontSuggestion: info.front || cleanWord
    });
  }

  // POST /api/dictionary/save-flashcard
  async saveWordAsFlashcard(req: Request, res: Response) {
    const userId = (req as any).user.id;
    const { front, back } = req.body;

    const card = this.flashcardRepo.create({
      user: { id: userId },
      front,
      back
    });

    const saved = await this.flashcardRepo.save(card);
    return res.status(201).json(saved);
  }
}
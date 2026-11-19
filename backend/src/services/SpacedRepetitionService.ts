import { Flashcard } from '../entities/Flashcard';

export class SpacedRepetitionService {
  // quality: 0 (errou feio) até 5 (perfeito)
  calculateNextReview(card: Flashcard, quality: number): Flashcard {
    if (quality >= 3) {
      if (card.repetitions === 0) {
        card.interval = 1;
      } else if (card.repetitions === 1) {
        card.interval = 6;
      } else {
        card.interval = Math.round(card.interval * card.easeFactor);
      }
      card.repetitions += 1;
    } else {
      card.repetitions = 0;
      card.interval = 1;
    }

    card.easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (card.easeFactor < 1.3) card.easeFactor = 1.3;

    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + card.interval);
    card.nextReviewDate = nextDate;

    return card;
  }
}
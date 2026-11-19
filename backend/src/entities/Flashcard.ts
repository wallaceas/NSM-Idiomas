import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { EbookHighlight } from './EbookHighlight';

@Entity('flashcards')
export class Flashcard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => EbookHighlight, { onDelete: 'SET NULL', nullable: true })
  highlight!: EbookHighlight;

  @Column({ type: 'text' })
  front!: string; // Termo ou frase sublinhada no idioma alvo

  @Column({ type: 'text' })
  back!: string; // Tradução, definição ou dica gerada por IA

  @Column({ type: 'float', default: 2.5 })
  easeFactor!: number; // Fator de facilidade (padrão SM-2 = 2.5)

  @Column({ type: 'int', default: 0 })
  interval!: number; // Intervalo em dias para a próxima revisão

  @Column({ type: 'int', default: 0 })
  repetitions!: number; // Número de vezes revisado com sucesso

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  nextReviewDate!: Date; // Próxima data em que o cartão deve aparecer para revisão

  @CreateDateColumn()
  createdAt!: Date;
}
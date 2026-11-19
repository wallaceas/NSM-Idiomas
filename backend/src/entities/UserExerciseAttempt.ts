import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Content } from './Content';

@Entity('user_exercise_attempts')
export class UserExerciseAttempt {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Content, { onDelete: 'CASCADE' })
  content!: Content;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  scorePercentage!: number; // Ex: 85.00

  @Column({ type: 'json' })
  submittedAnswers!: Record<string, any>; // Mapa { questionId: respostaDoAluno }

  @CreateDateColumn()
  completedAt!: Date;
}
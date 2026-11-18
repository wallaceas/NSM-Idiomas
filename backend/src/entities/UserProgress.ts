import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, Unique } from 'typeorm';
import { User } from './User';
import { Content } from './Content';

@Entity('user_progress')
@Unique(['user', 'content']) // Garante apenas 1 registro de progresso por aluno/conteúdo
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Content, { onDelete: 'CASCADE' })
  content!: Content;

  // Armazena segundos (ex: "145.5") para vídeos OU string CFI para e-books
  @Column({ type: 'varchar', length: 255, nullable: true })
  lastPosition!: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  percentage!: number;

  @Column({ type: 'boolean', default: false })
  isCompleted!: boolean;

  @UpdateDateColumn()
  updatedAt!: Date;
}
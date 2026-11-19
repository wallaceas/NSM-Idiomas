import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Content } from './Content';

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  FILL_IN_THE_BLANK = 'FILL_IN_THE_BLANK',
  SENTENCE_ORDER = 'SENTENCE_ORDER'
}

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Content, { onDelete: 'CASCADE' })
  content!: Content; // Módulo/Lição à qual a questão pertence

  @Column({ type: 'enum', enum: QuestionType })
  type!: QuestionType;

  @Column({ type: 'text' })
  prompt!: string; // Enunciado (ex: "Complete a frase:" ou "She ___ to school yesterday.")

  @Column({ type: 'json' })
  options!: any; // Ex: ["go", "went", "gone"] (Múltipla escolha) ou banco de palavras

  @Column({ type: 'json' })
  correctAnswer!: any; // NUNCA enviado ao frontend antes da correção! Ex: "went" ou ["She", "went", "home"]

  @Column({ type: 'text', nullable: true })
  explanation!: string; // Feedback gramatical exibido após o aluno responder

  @Column({ type: 'int', default: 1 })
  orderIndex!: number;
}
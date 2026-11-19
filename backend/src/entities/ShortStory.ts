import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Content } from './Content';

export interface StoryParagraph {
  order: number;
  targetText: string;      // Ex: "The rain started falling quietly over the city."
  nativeTranslation: string; // Tradução completa do parágrafo para apoio
}

@Entity('short_stories')
export class ShortStory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Content, { onDelete: 'CASCADE' })
  @JoinColumn()
  content!: Content;

  @Column({ type: 'varchar', length: 10, default: 'en' })
  languageCode!: string;

  @Column({ type: 'json' })
  paragraphs!: StoryParagraph[];
}
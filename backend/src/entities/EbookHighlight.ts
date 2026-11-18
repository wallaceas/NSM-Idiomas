import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { Content } from './Content';

@Entity('ebook_highlights')
export class EbookHighlight {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Content, { onDelete: 'CASCADE' })
  content!: Content;

  @Column({ type: 'varchar', length: 255 })
  cfiRange!: string; // Coordenada exata do trecho no EPUB

  @Column({ type: 'text' })
  highlightedText!: string;

  @Column({ type: 'varchar', length: 20, default: '#FFE066' })
  color!: string;

  @Column({ type: 'text', nullable: true })
  note!: string; // Anotação opcional do aluno sobre o trecho

  @CreateDateColumn()
  createdAt!: Date;
}
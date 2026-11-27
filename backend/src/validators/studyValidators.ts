import { z } from 'zod';

export const syncProgressSchema = z.object({
  contentId: z.string().uuid('contentId deve ser um UUID válido.'),
  lastPosition: z.string().trim().max(255).nullable().optional().default(''),
  percentage: z.coerce.number().min(0).max(100),
});

export const createHighlightSchema = z.object({
  contentId: z.string().uuid('contentId deve ser um UUID válido.'),
  cfiRange: z.string().trim().min(1, 'cfiRange é obrigatório.').max(255),
  highlightedText: z.string().trim().min(1, 'highlightedText é obrigatório.').max(5000),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar em formato hexadecimal #RRGGBB.')
    .optional()
    .default('#FFE066'),
  note: z.string().trim().max(2000).nullable().optional(),
  createFlashcard: z.boolean().optional().default(true),
});

export const reviewFlashcardSchema = z.object({
  quality: z.coerce.number().int().min(0).max(5),
});

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): {
  success: true;
  data: T;
} | {
  success: false;
  errors: string[];
} {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`),
    };
  }
  return { success: true, data: parsed.data };
}
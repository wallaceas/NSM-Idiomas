import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export class AiFlashcardService {
  async generateFlashcardContent(targetText: string, targetLanguage: string) {
    const prompt = `Analise o trecho "${targetText}" no idioma ${targetLanguage}. 
    Retorne um JSON estrito contendo:
    - "front": a palavra ou expressão principal isolada ou no contexto original.
    - "back": a tradução precisa para o português e uma breve explicação gramatical ou de uso.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }
}
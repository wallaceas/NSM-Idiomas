import React, { useEffect, useRef, useState } from 'react';
import ePub, { Book, Rendition } from 'epubjs';
import { api } from '../../services/api';

interface Highlight {
  id: string;
  cfiRange: string;
  highlightedText: string;
  color: string;
}

interface EpubReaderProps {
  contentId: string;
  epubUrl: string;
  initialCfi?: string;
  savedHighlights: Highlight[];
}

export const EpubReader: React.FC<EpubReaderProps> = ({
  contentId,
  epubUrl,
  initialCfi,
  savedHighlights
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const renditionRef = useRef<Rendition | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>(savedHighlights);

  useEffect(() => {
    if (!viewerRef.current) return;

    const book: Book = ePub(epubUrl);
    const rendition = book.renderTo(viewerRef.current, {
      width: '100%',
      height: '600px',
      flow: 'paginated'
    });
    renditionRef.current = rendition;

    // 1. Retoma exatamente de onde o aluno parou
    rendition.display(initialCfi || undefined);

    // 2. Gera mapa de localizações para calcular % de progresso real
    book.ready.then(() => book.locations.generate(1024));

    // 3. Restaura sublinhados existentes do banco de dados
    savedHighlights.forEach((hl) => {
      rendition.annotations.highlight(hl.cfiRange, {}, undefined, undefined, {
        fill: hl.color,
        'fill-opacity': '0.4'
      });
    });

    // 4. Evento disparado ao mudar de página (Salva posição no MySQL)
    rendition.on('relocated', async (location: any) => {
      const currentCfi = location.start.cfi;
      const percentage = book.locations.percentageFromCfi(currentCfi) * 100;

      await api.post('/progress/sync', {
        contentId,
        lastPosition: currentCfi,
        percentage: Math.round(percentage)
      });
    });

    // 5. Evento disparado ao selecionar texto (Cria novo sublinhado)
    rendition.on('selected', async (cfiRange: string, contents: any) => {
      const selectedText = rendition.getRange(cfiRange).toString();
      if (!selectedText.trim()) return;

      const color = '#FFE066';
      rendition.annotations.highlight(cfiRange, {}, undefined, undefined, {
        fill: color,
        'fill-opacity': '0.4'
      });

      const { data } = await api.post('/highlights', {
        contentId,
        cfiRange,
        highlightedText: selectedText,
        color
      });

      setHighlights((prev) => [...prev, data]);
      contents.window.getSelection().removeAllRanges();
    });

    return () => {
      book.destroy();
    };
  }, [epubUrl]);

  return (
    <div className="flex gap-4">
      <div className="flex-1 border rounded-lg shadow-sm bg-white p-4">
        <div ref={viewerRef} />
        <div className="flex justify-between mt-4">
          <button onClick={() => renditionRef.current?.prev()}>Anterior</button>
          <button onClick={() => renditionRef.current?.next()}>Próxima</button>
        </div>
      </div>

      {/* Painel lateral de trechos importantes salvos */}
      <aside className="w-80 border rounded-lg p-4 bg-gray-50 overflow-y-auto h-[660px]">
        <h3 className="font-bold mb-3">Trechos Importantes ({highlights.length})</h3>
        {highlights.map((hl) => (
          <div
            key={hl.id}
            onClick={() => renditionRef.current?.display(hl.cfiRange)}
            className="p-2 mb-2 bg-yellow-100 rounded cursor-pointer text-sm hover:bg-yellow-200"
          >
            "{hl.highlightedText}"
          </div>
        ))}
      </aside>
    </div>
  );
};
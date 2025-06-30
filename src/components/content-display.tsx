'use client';
import { ReactNode } from 'react';
import { Card, CardContent } from './ui/card';

interface ContentDisplayProps {
  content: string;
}

const parseMarkdownToReact = (text: string): ReactNode[] => {
  const lines = text.split('\n');
  const elements: ReactNode[] = [];
  let listItems: ReactNode[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-inside list-disc space-y-1 my-2">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };
  
  const parseInlineFormatting = (text: string): ReactNode => {
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
        return part;
    });
  };

  lines.forEach((line, index) => {
    if (line.startsWith('### ')) {
      flushList();
      elements.push(<h3 key={index} className="text-lg font-bold mt-3 mb-1 font-headline">{line.substring(4)}</h3>);
      return;
    }
    if (line.startsWith('## ')) {
      flushList();
      elements.push(<h2 key={index} className="text-xl font-bold mt-4 mb-2 font-headline">{line.substring(3)}</h2>);
      return;
    }
    if (line.startsWith('# ')) {
      flushList();
      elements.push(<h1 key={index} className="text-2xl font-bold mt-4 mb-2 font-headline">{line.substring(2)}</h1>);
      return;
    }
    if (line.startsWith('- ')) {
      const content = line.substring(2);
      listItems.push(<li key={index}>{parseInlineFormatting(content)}</li>);
      return;
    }
    
    flushList();

    if (line.trim() === '') {
      if (elements.length > 0 && elements[elements.length -1] !== <br key={index-1} />) {
         elements.push(<br key={index} />);
      }
    } else {
      elements.push(<p key={index}>{parseInlineFormatting(line)}</p>);
    }
  });

  flushList();
  return elements;
};

export function ContentDisplay({ content }: ContentDisplayProps) {
  if (!content) {
    return (
      <p className="text-center italic text-muted-foreground mt-4">
        Nenhum conteúdo gerado ainda.
      </p>
    );
  }

  const codeBlockMatch = content.match(/^```(?:json|text|markdown)?\n([\s\S]*?)```$/);

  if (codeBlockMatch && codeBlockMatch[1]) {
    const code = codeBlockMatch[1];
    return (
      <Card className="bg-gray-900 text-white dark:bg-black mt-4">
          <CardContent className="p-4">
            <pre className="overflow-x-auto whitespace-pre-wrap text-sm font-code">
                <code>{code}</code>
            </pre>
          </CardContent>
      </Card>
    );
  }

  return (
    <div className="prose prose-sm dark:prose-invert mt-4 max-w-none rounded-xl border bg-secondary/20 p-6 leading-relaxed">
      {parseMarkdownToReact(content)}
    </div>
  );
}


'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ActiveView } from '@/types';
import { BookOpen, Clapperboard, FileText, Film, Grid, Image as ImageIcon, LayoutGrid, Palette, Rocket, Users, Video, Zap } from 'lucide-react';
import React from 'react';

interface BentoGridProps {
    setView: (view: ActiveView) => void;
}

const BentoCard = ({ title, description, icon, onClick, className }: { title: string, description: string, icon: React.ReactNode, onClick: () => void, className?: string }) => (
    <Card 
        className={`group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-xl bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20 ${className}`}
        onClick={onClick}
    >
        <CardHeader>
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {icon}
            </div>
            <CardTitle className="font-headline text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
        <div className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-black/10 to-transparent" />
        <div className="pointer-events-none absolute -bottom-1/4 left-0 h-1/2 w-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/10 to-transparent transition-all duration-500 group-hover:h-full" />
    </Card>
);

export default function BentoGrid({ setView }: BentoGridProps) {
    return (
        <div className="bento-grid">
            <BentoCard
                className="md:col-span-2 lg:col-span-2 lg:row-span-2"
                title="Criador de Personagens e Cenas"
                description="A ferramenta principal para dar vida às suas ideias. Crie influenciadores e defina as cenas para os seus vídeos."
                icon={<Palette size={24} />}
                onClick={() => setView('creator')}
            />
             <BentoCard
                className="md:col-span-1 lg:col-span-1"
                title="Gerador de Roteiro Viral"
                description="Use a fórmula viral para criar roteiros curtos e de alto impacto para Shorts e TikTok."
                icon={<Rocket size={24} />}
                onClick={() => setView('viralTools')}
            />
             <BentoCard
                className="md:col-span-1 lg:col-span-1"
                title="Transcrever Vídeo"
                description="Transforme áudio de vídeos em texto para criar novos roteiros e conteúdos."
                icon={<FileText size={24} />}
                onClick={() => setView('viralTools')}
            />
             <BentoCard
                 className="md:col-span-1 lg:col-span-1 lg:row-span-1"
                title="Galeria de Cenas"
                description="Veja e gira todas as cenas que você criou."
                icon={<Clapperboard size={24} />}
                onClick={() => setView('sceneGallery')}
            />
            <BentoCard
                className="md:col-span-1 lg:col-span-1"
                title="Galeria de Personagens"
                description="Aceda e gira todos os seus personagens guardados."
                icon={<Users size={24} />}
                onClick={() => setView('influencerGallery')}
            />
             <BentoCard
                className="md:col-span-1 lg:col-span-1"
                title="Gerador de Thumbnail"
                description="Crie thumbnails chamativas para os seus vídeos usando IA."
                icon={<ImageIcon size={24} />}
                onClick={() => setView('viralTools')}
            />
            <BentoCard
                className="md:col-span-2 lg:col-span-2"
                title="Ferramentas de Roteiro Avançadas"
                description="Gere roteiros longos, para web docs, e transforme roteiros prontos em prompts de imagem e vídeo."
                icon={<Zap size={24} />}
                onClick={() => setView('advancedTools')}
            />
        </div>
    );
}

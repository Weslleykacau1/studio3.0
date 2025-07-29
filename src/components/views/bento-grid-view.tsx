
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ActiveView } from '@/types';
import { BookOpen, Clapperboard, Film, Grid, Image as ImageIcon, LayoutGrid, Palette, Users, Video, Zap } from 'lucide-react';
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
                className="col-span-1 lg:col-span-2"
                title="Criador de Personagens e Cenas"
                description="A ferramenta principal para dar vida às suas ideias. Crie influenciadores e defina as cenas para os seus vídeos."
                icon={<Palette size={24} />}
                onClick={() => setView('creator')}
            />
             <BentoCard
                title="Galeria de Personagens"
                description="Aceda e gira todos os seus personagens guardados."
                icon={<Users size={24} />}
                onClick={() => setView('influencerGallery')}
            />
             <BentoCard
                title="Galeria de Cenas"
                description="Veja e gira todas as cenas que você criou."
                icon={<Clapperboard size={24} />}
                onClick={() => setView('sceneGallery')}
            />
             <BentoCard
                className="col-span-1 lg:col-span-3"
                title="Ferramentas de Vídeo"
                description="Gere roteiros virais, para web docs, vídeos longos, transcreva vídeos e crie thumbnails com IA."
                icon={<Zap size={24} />}
                onClick={() => setView('viralVideo')}
            />
        </div>
    );
}

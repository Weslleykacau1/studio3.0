
'use client';

import { useState, useEffect } from 'react';

import type { Influencer, Scene, ActiveView, LoadingStates, ThumbnailIdeas } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { handleImageUpload as handleImageUploadUtil } from '@/lib/utils';
import { analyzeTextProfile } from '@/ai/flows/analyze-text-profile';
import { analyzeInfluencerImage } from '@/ai/flows/analyze-influencer-image';
import { analyzeSceneBackground } from '@/ai/flows/analyze-scene-background';
import { analyzeProductImage } from '@/ai/flows/analyze-product-image';
import { generateVideoScript } from '@/ai/flows/generate-video-script';
import { generateSeoForPlatforms } from '@/ai/flows/generate-seo-flow';
import { generateSceneAction } from '@/ai/flows/generate-scene-action';
import { generateSceneTitle } from '@/ai/flows/generate-scene-title';
import { generateSceneDialogue } from '@/ai/flows/generate-scene-dialogue';
import { generateQuickScene } from '@/ai/flows/generate-quick-scene';
import { generateVeoPrompt } from '@/ai/flows/generate-veo-prompt';
import { analyzeYouTubeVideo } from '@/ai/flows/analyze-youtube-video';
import { generateThumbnailIdeas } from '@/ai/flows/generate-thumbnail-ideas';
import { generateViralScript } from '@/ai/flows/generate-viral-script';
import { getAllInfluencers, saveInfluencer, deleteInfluencerDB, getAllScenes, saveScene, deleteSceneDB } from '@/lib/idb';

import { AppHeader } from './app-header';
import { QuickSceneModal } from './quick-scene-modal';
import CreatorView from './views/creator-view';
import InfluencerGalleryView from './views/influencer-gallery-view';
import SceneGalleryView from './views/scene-gallery-view';
import ViralVideoView from './views/viral-video-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Film, Palette, LayoutGrid, Zap } from 'lucide-react';

const getInitialInfluencerState = (): Influencer => ({ id: null, name: '', niche: '', personality: '', appearance: '', bio: '', uniqueTrait: '', negativePrompt: '', age: '', gender: '', accent: '', imagePreview: '', seed: Math.floor(Math.random() * 1000000) });
const initialSceneState: Scene = { id: null, title: '', setting: '', action: '', dialogue: '', cameraAngle: 'Câmera Dinâmica (Criatividade da IA)', duration: '5 seg', videoFormat: '9:16 (Vertical)', productName: '', productBrand: '', productDescription: '', productImagePreview: '', productImageType: '', isPartnership: false, scenarioImagePreview: '', scenarioImageType: '', allowDigitalText: false, onlyPhysicalText: false, };

interface ScriptifyStudioProps {
  isApiConfigured: boolean;
}

export default function ScriptifyStudio({ isApiConfigured }: ScriptifyStudioProps) {
    const [activeView, setActiveView] = useState<ActiveView>('creator');
    
    const [influencer, setInfluencer] = useState<Influencer>(getInitialInfluencerState());
    const [galleryInfluencers, setGalleryInfluencers] = useState<Influencer[]>([]);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [currentScene, setCurrentScene] = useState<Scene>(initialSceneState);
    const [generatedContent, setGeneratedContent] = useState('');
    const [generatedSeoContent, setGeneratedSeoContent] = useState('');
    const [generatedVeoPrompt, setGeneratedVeoPrompt] = useState('');
    const [generatedVeoPromptForViral, setGeneratedVeoPromptForViral] = useState('');
    const [generatedThumbnailIdeas, setGeneratedThumbnailIdeas] = useState<ThumbnailIdeas | null>(null);
    const [generatedViralScene, setGeneratedViralScene] = useState<Scene | null>(null);

    const [loadingStates, setLoadingStates] = useState<LoadingStates>({ savingInfluencer: false, savingScene: false, analyzingInfluencer: false, analyzingScenario: false, analyzingProduct: false, generatingScript: false, analyzingFromText: false, generatingSeo: false, generatingAction: false, generatingTitle: false, generatingDialogue: false, generatingQuickScene: false, generatingVeoPrompt: false, analyzingYouTube: false, generatingThumbnail: false, generatingViralScript: false, generatingVeoPromptForViral: false });
    const [pastedText, setPastedText] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const { toast } = useToast();
    const [hasMounted, setHasMounted] = useState(false);
    
    const [isQuickSceneModalOpen, setIsQuickSceneModalOpen] = useState(false);
    const [selectedInfluencerForQuickScene, setSelectedInfluencerForQuickScene] = useState<Influencer | null>(null);
    const [generatedQuickScene, setGeneratedQuickScene] = useState<Scene | null>(null);
    
    useEffect(() => {
        setHasMounted(true);
        
        async function loadData() {
            try {
                const [savedInfluencers, savedScenes] = await Promise.all([
                    getAllInfluencers(),
                    getAllScenes()
                ]);
                setGalleryInfluencers(savedInfluencers);
                setScenes(savedScenes);
            } catch (error) {
                console.error("Failed to load data from IndexedDB", error);
                toast({ variant: 'destructive', title: "Erro ao carregar dados locais", description: "Os seus dados guardados não puderam ser carregados." });
            }
        }

        loadData();
    }, [toast]);

    const setLoading = (key: keyof LoadingStates, value: boolean) => {
        setLoadingStates(prev => ({ ...prev, [key]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, imageType: 'influencer' | 'scenario' | 'product') => {
        handleImageUploadUtil(e, ({ preview, base64, type, file }) => {
            switch(imageType) {
                case 'influencer':
                    setInfluencer(inf => ({ ...inf, imagePreview: preview }));
                    break;
                case 'scenario':
                    setCurrentScene(cs => ({ ...cs, scenarioImagePreview: preview, scenarioImageType: type }));
                    break;
                case 'product':
                    setCurrentScene(cs => ({ ...cs, productImagePreview: preview, productImageType: type }));
                    break;
            }
        });
    };

    // AI Handlers
    const analyzeAndFillFromText = async () => {
        if (!pastedText.trim()) return toast({ variant: 'destructive', title: "Texto em falta", description: "Cole algum texto para analisar." });
        setLoading('analyzingFromText', true);
        try {
            const result = await analyzeTextProfile({ pastedText });
            setInfluencer(prev => ({ ...prev, ...result, seed: getInitialInfluencerState().seed }));
            toast({ title: "Características preenchidas a partir do texto!", className: "bg-green-100 text-green-800" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Análise", description: error.message });
        } finally {
            setLoading('analyzingFromText', false);
        }
    };
    
    const analyzeInfluencerImageAndFill = async () => {
        if (!influencer.imagePreview) return toast({ variant: 'destructive', title: "Imagem em falta", description: "Selecione uma imagem para analisar." });
        
        const photoDataUri = influencer.imagePreview;

        setLoading('analyzingInfluencer', true);
        try {
            const result = await analyzeInfluencerImage({ photoDataUri });
            setInfluencer(prev => ({ ...prev, ...result, imagePreview: photoDataUri, seed: getInitialInfluencerState().seed }));
            toast({ title: "Características preenchidas com detalhe!", className: "bg-green-100 text-green-800" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Análise", description: error.message });
        } finally {
            setLoading('analyzingInfluencer', false);
        }
    };

    const analyzeScenarioImageAndFill = async () => {
        if (!currentScene.scenarioImagePreview) return toast({ variant: 'destructive', title: "Imagem em falta", description: "Selecione uma imagem de cenário." });
        setLoading('analyzingScenario', true);
        try {
            const result = await analyzeSceneBackground({
                scenarioImageBase64: currentScene.scenarioImagePreview,
                scenarioImageType: currentScene.scenarioImageType,
            });
            setCurrentScene(prev => ({ ...prev, setting: result.settingDescription || '' }));
            toast({ title: "Cenário preenchido com base na imagem!", className: "bg-green-100 text-green-800" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Análise", description: error.message });
        } finally {
            setLoading('analyzingScenario', false);
        }
    };
    
    const generateSceneActionHandler = async () => {
        if (!currentScene.setting) return toast({ variant: 'destructive', title: "Cenário em falta", description: "Escreva uma descrição do cenário para gerar uma ação." });
        
        setLoading('generatingAction', true);
        try {
            const result = await generateSceneAction({
                sceneSetting: currentScene.setting,
            });
            setCurrentScene(prev => ({ ...prev, action: result.sceneAction || '' }));
            toast({ title: "Ação principal gerada com sucesso!", className: "bg-green-100 text-green-800" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Geração da Ação", description: error.message });
        } finally {
            setLoading('generatingAction', false);
        }
    };
    
    const generateSceneTitleHandler = async () => {
        if (!currentScene.setting || !currentScene.action) return toast({ variant: 'destructive', title: "Dados em falta", description: "Escreva uma descrição do cenário e da ação para gerar um título." });
        
        setLoading('generatingTitle', true);
        try {
            const result = await generateSceneTitle({
                sceneSetting: currentScene.setting,
                sceneAction: currentScene.action,
            });
            setCurrentScene(prev => ({ ...prev, title: result.sceneTitle || '' }));
            toast({ title: "Título da cena gerado com sucesso!", className: "bg-green-100 text-green-800" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Geração do Título", description: error.message });
        } finally {
            setLoading('generatingTitle', false);
        }
    };

    const generateSceneDialogueHandler = async () => {
        if (!influencer.id) return toast({ variant: 'destructive', title: "Influenciador em falta", description: "Carregue um influenciador primeiro." });
        if (!currentScene.setting || !currentScene.action) return toast({ variant: 'destructive', title: "Dados em falta", description: "Escreva uma descrição do cenário e da ação para gerar um diálogo." });
        
        setLoading('generatingDialogue', true);
        try {
            const result = await generateSceneDialogue({
                influencerPersonality: influencer.personality,
                influencerAccent: influencer.accent,
                sceneSetting: currentScene.setting,
                sceneAction: currentScene.action,
                sceneDuration: currentScene.duration,
            });
            setCurrentScene(prev => ({ ...prev, dialogue: result.dialogue || '' }));
            toast({ title: "Diálogo gerado com sucesso!", className: "bg-green-100 text-green-800" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Geração do Diálogo", description: error.message });
        } finally {
            setLoading('generatingDialogue', false);
        }
    };

    const analyzeAndDescribeProduct = async () => {
        if (!currentScene.productImagePreview) return toast({ variant: 'destructive', title: "Imagem em falta", description: "Selecione uma imagem de produto." });
        setLoading('analyzingProduct', true);
        try {
            const result = await analyzeProductImage({
                productImageDataUri: currentScene.productImagePreview,
            });
            setCurrentScene(prev => ({ ...prev, productDescription: result.productDescription || '' }));
            toast({ title: "Descrição do produto gerada!", className: "bg-green-100 text-green-800" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Análise", description: error.message });
        } finally {
            setLoading('analyzingProduct', false);
        }
    };

    const generateSceneContent = async (sceneToGenerate: Scene) => {
        if (!influencer.id) return toast({ variant: 'destructive', title: "Influenciador em falta", description: "Carregue ou crie e guarde um influenciador primeiro." });
        if (!sceneToGenerate.setting) return toast({ variant: 'destructive', title: "Cenário em falta", description: "O campo 'Cenário' é obrigatório na cena." });
        
        setLoading('generatingScript', true);
        setGeneratedContent('');
        
        try {
            const responseText = await generateVideoScript({
                influencerName: influencer.name,
                influencerPersonality: influencer.personality,
                influencerAppearance: influencer.appearance,
                influencerNiche: influencer.niche,
                influencerSeed: influencer.seed,
                influencerAccent: influencer.accent,
                sceneTitle: sceneToGenerate.title,
                sceneSetting: sceneToGenerate.setting,
                sceneAction: sceneToGenerate.action,
                sceneDialogue: sceneToGenerate.dialogue,
                sceneCameraAngle: sceneToGenerate.cameraAngle,
                sceneDuration: sceneToGenerate.duration,
                sceneVideoFormat: sceneToGenerate.videoFormat,
                productName: sceneToGenerate.productName,
                productBrand: sceneToGenerate.productBrand,
                productDescription: sceneToGenerate.productDescription,
                isPartnership: sceneToGenerate.isPartnership,
                allowDigitalText: sceneToGenerate.allowDigitalText,
                onlyPhysicalText: sceneToGenerate.onlyPhysicalText,
            });
            
            setGeneratedContent(responseText);
            
            toast({ title: "Roteiro em Markdown gerado com sucesso!", className: "bg-green-100 text-green-800" });
        } catch (error: any) {
            setGeneratedContent(`**Falha ao gerar roteiro:**\n\n${error.message}`);
            toast({ variant: 'destructive', title: "Erro na Geração do Roteiro", description: error.message });
        } finally {
            setLoading('generatingScript', false);
        }
    };
    
    const generateVeoPromptHandler = async () => {
        if (!influencer.id) return toast({ variant: 'destructive', title: "Influenciador em falta", description: "Carregue ou crie e guarde um influenciador primeiro." });
        if (!currentScene.setting) return toast({ variant: 'destructive', title: "Cenário em falta", description: "O campo 'Cenário' é obrigatório na cena." });
        
        setLoading('generatingVeoPrompt', true);
        setGeneratedVeoPrompt('');
        try {
            const result = await generateVeoPrompt({
                influencerAppearance: influencer.appearance,
                sceneSetting: currentScene.setting,
                sceneAction: currentScene.action,
                sceneDialogue: currentScene.dialogue,
                sceneCameraAngle: currentScene.cameraAngle,
                videoFormat: currentScene.videoFormat,
            });
            
            setGeneratedVeoPrompt(result.veoPrompt);
            toast({ title: "Prompt para Veo gerado com sucesso!", className: "bg-green-100 text-green-800" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Geração do Prompt Veo", description: error.message });
        } finally {
            setLoading('generatingVeoPrompt', false);
        }
    };

    const generateDialogueSeo = async () => {
        if (!currentScene.dialogue) return toast({ variant: 'destructive', title: "Diálogo em falta", description: "Escreva um diálogo na cena para gerar o SEO." });
        
        setLoading('generatingSeo', true);
        setGeneratedSeoContent('');
        try {
            const responseText = await generateSeoForPlatforms({
                dialogue: currentScene.dialogue,
            });
            setGeneratedSeoContent(responseText);
            toast({ title: "SEO gerado com sucesso!", className: "bg-green-100 text-green-800" });
        } catch (error: any) {
            setGeneratedSeoContent(`**Falha ao gerar SEO:**\n\n${error.message}`);
            toast({ variant: 'destructive', title: "Erro na Geração de SEO", description: error.message });
        } finally {
            setLoading('generatingSeo', false);
        }
    };

    const handleAnalyzeYouTubeVideo = async () => {
        if (!youtubeUrl.trim()) return toast({ variant: 'destructive', title: "URL em falta", description: "Por favor, cole um URL do YouTube." });
        if (!isApiConfigured) return toast({ variant: 'destructive', title: "Chave API necessária", description: "É necessária uma chave API para usar esta função." });

        setLoading('analyzingYouTube', true);
        setGeneratedViralScene(null); // Clear previous results
        setGeneratedVeoPromptForViral(''); // Clear previous Veo prompt
        try {
            const result = await analyzeYouTubeVideo({ youtubeUrl });
            const newScene: Scene = {
                ...initialSceneState,
                id: crypto.randomUUID(),
                ...result,
                duration: '8 seg',
            };

            await saveScene(newScene);
            setScenes(prev => [newScene, ...prev]);
            setGeneratedViralScene(newScene); // Set scene for display in viral tab
            
            toast({ title: "Cena criada a partir do vídeo!", description: `A cena "${newScene.title}" foi gerada abaixo e guardada na sua galeria.`, className: "bg-green-100 text-green-800" });

        } catch (error: any) {
            console.error("Failed to analyze YouTube video:", error);
            toast({ variant: 'destructive', title: "Erro na Análise", description: error.message });
        } finally {
            setLoading('analyzingYouTube', false);
        }
    };

    const handleGenerateThumbnailIdeas = async (referenceImageDataUri: string, videoTheme: string) => {
        if (!referenceImageDataUri || !videoTheme) {
            return toast({ variant: 'destructive', title: "Informação em falta", description: "Por favor, carregue a imagem e preencha o tema do vídeo." });
        }
        
        setLoading('generatingThumbnail', true);
        setGeneratedThumbnailIdeas(null);
        try {
            const result = await generateThumbnailIdeas({ referenceImageDataUri, videoTheme });
            setGeneratedThumbnailIdeas(result);
            toast({ title: "Ideias para thumbnail geradas!", className: "bg-green-100 text-green-800" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Geração", description: error.message });
        } finally {
            setLoading('generatingThumbnail', false);
        }
    };

    // Quick Scene Handlers
    const handleOpenQuickSceneModal = (id: string) => {
        const influencerToLoad = galleryInfluencers.find(inf => inf.id === id);
        if (influencerToLoad) {
            setSelectedInfluencerForQuickScene(influencerToLoad);
            setGeneratedQuickScene(null); // Reset previous generation
            setIsQuickSceneModalOpen(true);
        }
    };

    const handleGenerateQuickScene = async (jokeTheme: string, scenarioSuggestion?: string, imageReferenceDataUri?: string) => {
        if (!selectedInfluencerForQuickScene) return;
        setLoading('generatingQuickScene', true);
        setGeneratedQuickScene(null);
        try {
            const result = await generateQuickScene({
                influencerPersonality: selectedInfluencerForQuickScene.personality,
                influencerNiche: selectedInfluencerForQuickScene.niche,
                jokeTheme: jokeTheme,
                scenarioSuggestion: scenarioSuggestion,
                imageReferenceDataUri: imageReferenceDataUri,
            });
            const newScene: Scene = {
                ...initialSceneState, // use initial state for other fields
                ...result,
                duration: '8 seg',
            };
            setGeneratedQuickScene(newScene);
            toast({ title: "Cena rápida gerada com sucesso!", className: "bg-green-100 text-green-800" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro ao gerar cena", description: error.message });
        } finally {
            setLoading('generatingQuickScene', false);
        }
    };

    const handleSaveAndLoadQuickScene = async () => {
        if (!generatedQuickScene || !selectedInfluencerForQuickScene) return;

        // Save the scene
        const sceneToSave = { ...generatedQuickScene, id: crypto.randomUUID() };
        await saveScene(sceneToSave);
        setScenes(prev => [...prev, sceneToSave]);

        // Load influencer and scene into editors
        setInfluencer(selectedInfluencerForQuickScene);
        setCurrentScene(sceneToSave);
        
        // Switch view and close modal
        setActiveView('creator');
        setIsQuickSceneModalOpen(false);
        toast({ title: "Cena salva e carregada no editor!", className: "bg-blue-100 text-blue-800" });
    };

    const handleGenerateViralScript = async (videoTitle: string, imageDataUri: string | null, duration: string, videoType: 'shorts' | 'watch') => {
        if (!isApiConfigured) return toast({ variant: 'destructive', title: "Chave API necessária", description: "É necessária uma chave API para usar esta função." });
        if (!videoTitle.trim()) return toast({ variant: 'destructive', title: "Informação em falta", description: "É preciso um tema para o roteiro." });

        setLoading('generatingViralScript', true);
        setGeneratedViralScene(null);
        setGeneratedVeoPromptForViral(''); // Clear previous Veo prompt
        try {
            const result = await generateViralScript({ 
                videoTitle, 
                imageDataUri: imageDataUri || undefined,
                duration, 
                videoType 
            });

            const newScene: Scene = {
                ...initialSceneState,
                id: crypto.randomUUID(),
                ...result,
                duration: duration,
            };

            await saveScene(newScene);
            setScenes(prev => [newScene, ...prev]);
            setGeneratedViralScene(newScene);

            toast({ 
                title: "Roteiro viral gerado!", 
                description: `A cena "${newScene.title}" foi gerada abaixo e guardada na sua galeria.`,
                className: "bg-green-100 text-green-800"
            });

        } catch (error: any) {
            console.error("Failed to generate viral script:", error);
            toast({ variant: 'destructive', title: "Erro na Geração", description: error.message });
        } finally {
            setLoading('generatingViralScript', false);
        }
    };
    
    const handleGenerateVeoPromptForViralScene = async (scene: Scene) => {
        if (!scene.setting) {
            return toast({ variant: 'destructive', title: "Cenário em falta", description: "A cena gerada não tem um cenário para criar um prompt Veo." });
        }
        
        setLoading('generatingVeoPromptForViral', true);
        setGeneratedVeoPromptForViral('');
        try {
            const result = await generateVeoPrompt({
                sceneSetting: scene.setting,
                sceneAction: scene.action,
                sceneDialogue: scene.dialogue,
                sceneCameraAngle: scene.cameraAngle,
                videoFormat: scene.videoFormat,
            });
            
            setGeneratedVeoPromptForViral(result.veoPrompt);
            toast({ title: "Prompt para Veo gerado com sucesso!", className: "bg-green-100 text-green-800" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Geração do Prompt Veo", description: error.message });
        } finally {
            setLoading('generatingVeoPromptForViral', false);
        }
    };

    const handleLoadViralSceneToCreator = (scene: Scene) => {
        if (scene) {
            setCurrentScene(scene);
            setActiveView('creator');
            toast({ 
                title: `Cena "${scene.title || 'sem título'}" carregada!`, 
                description: "A cena está pronta para ser editada ou usada para gerar um roteiro.",
                className: "bg-blue-100 text-blue-800" 
            });
        }
    };
    
    // IndexedDB Handlers
    const saveOrUpdateInfluencer = async () => {
        const requiredFields: Array<keyof Influencer> = ['name', 'niche', 'personality', 'appearance', 'bio', 'uniqueTrait', 'age', 'gender', 'accent'];
        
        const missingFields = requiredFields.filter(field => {
            const value = influencer[field];
            if (typeof value === 'string') {
                return !value.trim();
            }
            return !value;
        });

        if (missingFields.length > 0) {
            const fieldLabels: Record<string, string> = {
                name: 'Nome',
                niche: 'Nicho',
                personality: 'Traços de Personalidade',
                appearance: 'Detalhes de Aparência',
                bio: 'Biografia Curta',
                uniqueTrait: 'Traço Único/Peculiar',
                age: 'Idade',
                gender: 'Género',
                accent: 'Sotaque',
            };
            const missingLabels = missingFields.map(field => fieldLabels[field as keyof typeof fieldLabels] || field).join(', ');
            toast({
                variant: 'destructive',
                title: "Campos obrigatórios em falta",
                description: `Por favor, preencha os seguintes campos: ${missingLabels}.`,
            });
            return;
        }

        setLoading('savingInfluencer', true);
        try {
            const influencerToSave = { ...influencer };
            if (!influencerToSave.id) {
                influencerToSave.id = crypto.randomUUID();
            }
            
            await saveInfluencer(influencerToSave);

            if (influencer.id) {
                setGalleryInfluencers(prev => prev.map(inf => inf.id === influencerToSave.id ? influencerToSave : inf));
                toast({ title: "Influenciador atualizado com sucesso!", className: "bg-green-100 text-green-800" });
            } else {
                setGalleryInfluencers(prev => [...prev, influencerToSave]);
                setInfluencer(influencerToSave);
                toast({ title: "Influenciador adicionado à galeria!", className: "bg-green-100 text-green-800" });
            }
        } catch (error) {
            console.error("Failed to save influencer:", error);
            toast({ variant: 'destructive', title: "Erro ao Guardar", description: "Não foi possível guardar o influenciador." });
        } finally {
            setLoading('savingInfluencer', false);
        }
    };
    
    const deleteInfluencer = async (idToDelete: string) => {
        try {
            await deleteInfluencerDB(idToDelete);
            setGalleryInfluencers(prev => prev.filter(inf => inf.id !== idToDelete));
            toast({ title: "Influenciador excluído!" });
            if (influencer.id === idToDelete) {
                setInfluencer(getInitialInfluencerState());
            }
        } catch (error) {
            console.error("Failed to delete influencer:", error);
            toast({ variant: 'destructive', title: "Erro ao Excluir", description: "Não foi possível excluir o influenciador." });
        }
    };
    
    const loadInfluencer = (id: string) => {
        const influencerToLoad = galleryInfluencers.find(inf => inf.id === id);
        if (influencerToLoad) {
            setInfluencer(influencerToLoad);
            setActiveView('creator');
            toast({ title: `"${influencerToLoad.name}" carregado no editor!`, className: "bg-blue-100 text-blue-800" });
        }
    };

    const handleAddUpdateScene = async () => {
        if (!currentScene.setting && !currentScene.title) return toast({ variant: 'destructive', title: "Dados em falta", description: "Preencha pelo menos um título ou um cenário." });

        setLoading('savingScene', true);
        try {
            const sceneToSave = { ...currentScene };
            if (!sceneToSave.id) {
                sceneToSave.id = crypto.randomUUID();
            }

            await saveScene(sceneToSave);

            if (currentScene.id) {
                setScenes(prev => prev.map(s => s.id === sceneToSave.id ? sceneToSave : s));
                toast({ title: "Cena atualizada com sucesso!", className: "bg-green-100 text-green-800" });
            } else {
                setScenes(prev => [...prev, sceneToSave]);
                setCurrentScene(sceneToSave);
                toast({ title: "Cena adicionada com sucesso!", className: "bg-green-100 text-green-800" });
            }
        } catch (error) {
            console.error("Failed to save scene:", error);
            toast({ variant: 'destructive', title: "Erro ao Guardar", description: "Não foi possível guardar a cena." });
        } finally {
            setLoading('savingScene', false);
        }
    };

    const deleteScene = async (idToDelete: string) => {
        try {
            await deleteSceneDB(idToDelete);
            setScenes(prev => prev.filter(s => s.id !== idToDelete));
            toast({ title: "Cena excluída!" });
            if (currentScene.id === idToDelete) {
                setCurrentScene(initialSceneState);
            }
        } catch (error) {
            console.error("Failed to delete scene:", error);
            toast({ variant: 'destructive', title: "Erro ao Excluir", description: "Não foi possível excluir a cena." });
        }
    };

    const loadScene = (id: string) => {
        const sceneToLoad = scenes.find(s => s.id === id);
        if (sceneToLoad) {
            setCurrentScene(sceneToLoad);
            setActiveView('creator');
            toast({ title: `Cena "${sceneToLoad.title || 'sem título'}" carregada!`, className: "bg-blue-100 text-blue-800" });
        }
    };

    const handleAddNewInfluencer = () => {
        setInfluencer(getInitialInfluencerState());
        setActiveView('creator');
    };

    const handleAddNewScene = () => {
        setCurrentScene(initialSceneState);
        setActiveView('creator');
    };

    if (!hasMounted) {
        return <div suppressHydrationWarning></div>;
    }


    return (
        <div suppressHydrationWarning>
            <QuickSceneModal
                isOpen={isQuickSceneModalOpen}
                onClose={() => setIsQuickSceneModalOpen(false)}
                influencer={selectedInfluencerForQuickScene}
                onGenerate={handleGenerateQuickScene}
                onSave={handleSaveAndLoadQuickScene}
                generatedScene={generatedQuickScene}
                loading={loadingStates.generatingQuickScene}
                isApiConfigured={isApiConfigured}
            />

            <AppHeader
                isApiConfigured={isApiConfigured}
            />

            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ActiveView)} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-primary/10">
                    <TabsTrigger value="creator"><Film className="mr-2 h-4 w-4 hidden sm:inline-block" />Criador</TabsTrigger>
                    <TabsTrigger value="influencerGallery">
                        <Palette className="mr-2 h-4 w-4 hidden sm:inline-block" />
                        <span className='sm:hidden'>Influenciadores</span>
                        <span className='hidden sm:inline'>Galeria de Influenciadores</span>
                    </TabsTrigger>
                    <TabsTrigger value="sceneGallery">
                        <LayoutGrid className="mr-2 h-4 w-4 hidden sm:inline-block" />
                        <span className='sm:hidden'>Cenas</span>
                        <span className='hidden sm:inline'>Galeria de Cenas</span>
                    </TabsTrigger>
                    <TabsTrigger value="viralVideo"><Zap className="mr-2 h-4 w-4 hidden sm:inline-block" />Vídeo Viral</TabsTrigger>
                </TabsList>

                <TabsContent value="creator" className="mt-6">
                    <CreatorView
                        influencer={influencer}
                        setInfluencer={setInfluencer}
                        currentScene={currentScene}
                        setCurrentScene={setCurrentScene}
                        pastedText={pastedText}
                        setPastedText={setPastedText}
                        generatedContent={generatedContent}
                        setGeneratedContent={setGeneratedContent}
                        generatedSeoContent={generatedSeoContent}
                        generatedVeoPrompt={generatedVeoPrompt}
                        loadingStates={loadingStates}
                        isApiConfigured={isApiConfigured}
                        handlers={{
                            analyzeAndFillFromText,
                            analyzeInfluencerImageAndFill,
                            analyzeScenarioImageAndFill,
                            analyzeAndDescribeProduct,
                            generateSceneContent,
                            generateVeoPrompt: generateVeoPromptHandler,
                            generateDialogueSeo,
                            generateSceneAction: generateSceneActionHandler,
                            generateSceneTitle: generateSceneTitleHandler,
                            generateSceneDialogue: generateSceneDialogueHandler,
                            saveOrUpdateInfluencer,
                            handleAddUpdateScene,
                            handleImageUpload,
                            resetInfluencer: () => setInfluencer(getInitialInfluencerState()),
                            resetScene: () => setCurrentScene(initialSceneState),
                        }}
                    />
                </TabsContent>
                <TabsContent value="influencerGallery" className="mt-6">
                    <InfluencerGalleryView
                        influencers={galleryInfluencers}
                        onLoad={loadInfluencer}
                        onDelete={deleteInfluencer}
                        onAddNew={handleAddNewInfluencer}
                        onQuickScene={handleOpenQuickSceneModal}
                    />
                </TabsContent>
                <TabsContent value="sceneGallery" className="mt-6">
                    <SceneGalleryView
                        scenes={scenes}
                        onLoad={loadScene}
                        onDelete={deleteScene}
                        onAddNew={handleAddNewScene}
                    />
                </TabsContent>
                <TabsContent value="viralVideo" className="mt-6">
                    <ViralVideoView
                        onGenerate={handleGenerateThumbnailIdeas}
                        generatedIdeas={generatedThumbnailIdeas}
                        loading={loadingStates.generatingThumbnail}
                        isApiConfigured={isApiConfigured}
                        youtubeUrl={youtubeUrl}
                        setYoutubeUrl={setYoutubeUrl}
                        onAnalyzeVideo={handleAnalyzeYouTubeVideo}
                        loadingYouTube={loadingStates.analyzingYouTube}
                        onGenerateViralScript={handleGenerateViralScript}
                        loadingViralScript={loadingStates.generatingViralScript}
                        generatedViralScene={generatedViralScene}
                        onLoadToCreator={handleLoadViralSceneToCreator}
                        onGenerateVeoPromptForViral={handleGenerateVeoPromptForViralScene}
                        loadingVeoForViral={loadingStates.generatingVeoPromptForViral}
                        generatedVeoPromptForViral={generatedVeoPromptForViral}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

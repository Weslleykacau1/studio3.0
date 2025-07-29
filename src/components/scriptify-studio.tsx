










'use client';

import { useState, useEffect } from 'react';
import type { Influencer, Scene, ActiveView, LoadingStates, ThumbnailIdeas, ThumbnailStyle, LongScriptScene, WebDocScript, ScenePrompts } from '@/types';
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
import { generateThumbnailIdeas } from '@/ai/flows/generate-thumbnail-ideas';
import { generateViralScript } from '@/ai/flows/generate-viral-script';
import { generateWebDocScript } from '@/ai/flows/generate-web-doc-script';
import { transcribeUploadedVideo } from '@/ai/flows/transcribe-uploaded-video';
import { generateScriptFromTranscription } from '@/ai/flows/generate-script-from-transcription';
import { generateParaphrasedScriptFromTranscription } from '@/ai/flows/generate-paraphrased-script-from-transcription';
import { generateLongScript } from '@/ai/flows/generate-long-script';
import { generatePromptsFromScript } from '@/ai/flows/generate-image-prompts-from-script';
import { generateSeoFromScript } from '@/ai/flows/generate-seo-from-script';
import { generateImageFromPrompt } from '@/ai/flows/generate-image-from-prompt';
import { generateThumbnailFromScript } from '@/ai/flows/generate-thumbnail-from-script';
import { AppHeader } from './app-header';
import { QuickSceneModal } from './quick-scene-modal';
import CreatorView from './views/creator-view';
import InfluencerGalleryView from './views/influencer-gallery-view';
import SceneGalleryView from './views/scene-gallery-view';
import ViralToolsView from './views/viral-tools-view';
import AdvancedToolsView from './views/advanced-tools-view';
import ThumbnailGeneratorView from './views/thumbnail-generator-view';
import TranscribeVideoView from './views/transcribe-video-view';
import { LoginModal } from './login-modal';
import { nanoid } from 'nanoid';
import { PromoBanner } from './promo-banner';
import BentoGrid from './views/bento-grid-view';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { LoadingScreen } from './loading-screen';
import { ImagePreviewModal } from './image-preview-modal';

const getInitialInfluencerState = (): Influencer => ({ id: null, name: '', niche: '', personality: '', appearance: '', clothing: '', bio: '', uniqueTrait: '', negativePrompt: '', age: '', gender: '', accent: '', imagePreview: '', seed: Math.floor(Math.random() * 1000000) });
const initialSceneState: Scene = { id: null, title: '', setting: '', action: '', dialogue: '', cameraAngle: 'Câmera Dinâmica (Criatividade da IA)', duration: '5 seg', videoFormat: '9:16 (Vertical)', productName: '', productBrand: '', productDescription: '', productImagePreview: '', productImageType: '', isPartnership: false, scenarioImagePreview: '', scenarioImageType: '', allowDigitalText: false, onlyPhysicalText: false, markdownScript: '' };

const COOKIE_KEY_INFLUENCERS = 'scriptify_influencers';
const COOKIE_KEY_SCENES = 'scriptify_scenes';
const COOKIE_KEY_API_KEY = 'gemini_api_key';
const COOKIE_KEY_PURCHASE = 'has_purchased';

export default function ScriptifyStudio() {
    const [activeView, setActiveView] = useState<ActiveView>('bento');
    
    const [influencer, setInfluencer] = useState<Influencer>(getInitialInfluencerState());
    const [galleryInfluencers, setGalleryInfluencers] = useState<Influencer[]>([]);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [currentScene, setCurrentScene] = useState<Scene>(initialSceneState);
    const [generatedContent, setGeneratedContent] = useState('');
    const [generatedSeoContent, setGeneratedSeoContent] = useState('');
    const [generatedVeoPrompt, setGeneratedVeoPrompt] = useState('');
    const [generatedThumbnailIdeas, setGeneratedThumbnailIdeas] = useState<ThumbnailIdeas | null>(null);
    const [generatedViralScene, setGeneratedViralScene] = useState<Scene | null>(null);
    const [generatedUploadedVideoTranscription, setGeneratedUploadedVideoTranscription] = useState('');
    const [generatedLongScript, setGeneratedLongScript] = useState<{ scenes: LongScriptScene[], fullScriptTxt: string } | null>(null);
    const [generatedWebDocScript, setGeneratedWebDocScript] = useState<WebDocScript | null>(null);
    const [generatedWebDocSeo, setGeneratedWebDocSeo] = useState('');
    const [pastedScript, setPastedScript] = useState('');
    const [generatedScenePrompts, setGeneratedScenePrompts] = useState<ScenePrompts[] | null>(null);
    const [generatedSeoFromScript, setGeneratedSeoFromScript] = useState('');
    const [generatedThumbnailFromScript, setGeneratedThumbnailFromScript] = useState<ThumbnailIdeas | null>(null);
    const [generatedThumbnailFromWebDoc, setGeneratedThumbnailFromWebDoc] = useState<ThumbnailIdeas | null>(null);


    const [loadingStates, setLoadingStates] = useState<LoadingStates>({ savingInfluencer: false, savingScene: false, analyzingInfluencer: false, analyzingScenario: false, analyzingProduct: false, generatingScript: false, analyzingFromText: false, generatingSeo: false, generatingAction: false, generatingTitle: false, generatingDialogue: false, generatingQuickScene: false, generatingVeoPrompt: false, analyzingYouTube: false, generatingThumbnail: false, generatingViralScript: false, transcribingUploadedVideo: false, generatingScriptFromTranscription: false, generatingParaphrasedScriptFromTranscription: false, generatingLongScript: false, generatingWebDoc: false, generatingWebDocSeo: false, generatingImagePrompts: false, generatingSeoFromScript: false, generatingThumbnailFromScript: false, generatingImageFromPastedScript: false, generatingThumbnailFromWebDoc: false, generatingWebDocImage: false });
    const [pastedText, setPastedText] = useState('');
    const [youtubeUrl, setYoutubeUrl] = useState('');
    const { toast } = useToast();
    const [hasMounted, setHasMounted] = useState(false);
    
    const [isQuickSceneModalOpen, setIsQuickSceneModalOpen] = useState(false);
    const [selectedInfluencerForQuickScene, setSelectedInfluencerForQuickScene] = useState<Influencer | null>(null);
    const [generatedQuickScene, setGeneratedQuickScene] = useState<Scene | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isApiConfigured, setIsApiConfigured] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);
    
    // State for image preview modal
    const [isImagePreviewModalOpen, setIsImagePreviewModalOpen] = useState(false);
    const [generatedImageForPopup, setGeneratedImageForPopup] = useState<string | null>(null);
    const [activePromptForImageGen, setActivePromptForImageGen] = useState('');

    
    // Load data from cookies when component mounts on the client
    useEffect(() => {
        setHasMounted(true);
        
        // Check for purchase status in URL first
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('purchase_success') === 'true') {
            document.cookie = `${COOKIE_KEY_PURCHASE}=true;path=/;max-age=31536000;samesite=strict`;
            setHasPurchased(true);
             // Remove query params from URL without reloading
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            // Then check cookie
            const purchaseCookie = document.cookie.split('; ').find(row => row.startsWith(`${COOKIE_KEY_PURCHASE}=`));
            if (purchaseCookie && purchaseCookie.split('=')[1] === 'true') {
                setHasPurchased(true);
            }
        }

        try {
            const influencersCookie = document.cookie.split('; ').find(row => row.startsWith(`${COOKIE_KEY_INFLUENCERS}=`));
            if (influencersCookie) {
                const decoded = decodeURIComponent(influencersCookie.split('=')[1]);
                setGalleryInfluencers(JSON.parse(decoded));
            }
        } catch (e) {
            console.error("Failed to parse influencers from cookies:", e);
        }

        try {
            const scenesCookie = document.cookie.split('; ').find(row => row.startsWith(`${COOKIE_KEY_SCENES}=`));
            if (scenesCookie) {
                 const decoded = decodeURIComponent(scenesCookie.split('=')[1]);
                setScenes(JSON.parse(decoded));
            }
        } catch (e) {
             console.error("Failed to parse scenes from cookies:", e);
        }

        const apiKeyCookie = document.cookie.split('; ').find(row => row.startsWith(`${COOKIE_KEY_API_KEY}=`));
        if (apiKeyCookie) {
            const key = apiKeyCookie.split('=')[1];
            if (key && key.trim() !== '') {
                setIsApiConfigured(true);
            }
        }

    }, []);
    
    // Save data to cookies whenever it changes
    useEffect(() => {
        if (hasMounted) {
            document.cookie = `${COOKIE_KEY_INFLUENCERS}=${encodeURIComponent(JSON.stringify(galleryInfluencers))};path=/;max-age=31536000;samesite=strict`;
        }
    }, [galleryInfluencers, hasMounted]);

    useEffect(() => {
        if (hasMounted) {
            document.cookie = `${COOKIE_KEY_SCENES}=${encodeURIComponent(JSON.stringify(scenes))};path=/;max-age=31536000;samesite=strict`;
        }
    }, [scenes, hasMounted]);


    const handleApiKeySave = (apiKey: string) => {
        document.cookie = `${COOKIE_KEY_API_KEY}=${apiKey};path=/;max-age=31536000;samesite=strict`;
        setIsApiConfigured(true);
        setIsLoginModalOpen(false);
    };

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
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!pastedText.trim()) return toast({ variant: 'destructive', title: "Texto em falta", description: "Cole algum texto para analisar." });
        setLoading('analyzingFromText', true);
        try {
            const result = await analyzeTextProfile({ pastedText });
            setInfluencer(prev => ({ ...prev, ...result, seed: getInitialInfluencerState().seed }));
            toast({ variant: 'success', title: "Características preenchidas a partir do texto!" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Análise", description: error.message });
        } finally {
            setLoading('analyzingFromText', false);
        }
    };
    
    const analyzeInfluencerImageAndFill = async () => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!influencer.imagePreview) return toast({ variant: 'destructive', title: "Imagem em falta", description: "Selecione uma imagem para analisar." });
        
        const photoDataUri = influencer.imagePreview;

        setLoading('analyzingInfluencer', true);
        try {
            const result = await analyzeInfluencerImage({ photoDataUri });
            setInfluencer(prev => ({ ...prev, ...result, imagePreview: photoDataUri, seed: getInitialInfluencerState().seed }));
            toast({ variant: 'success', title: "Características preenchidas com detalhe!" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Análise", description: error.message });
        } finally {
            setLoading('analyzingInfluencer', false);
        }
    };

    const analyzeScenarioImageAndFill = async () => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!currentScene.scenarioImagePreview) return toast({ variant: 'destructive', title: "Imagem em falta", description: "Selecione uma imagem de cenário." });
        setLoading('analyzingScenario', true);
        try {
            const result = await analyzeSceneBackground({
                scenarioImageBase64: currentScene.scenarioImagePreview,
                scenarioImageType: currentScene.scenarioImageType,
            });
            setCurrentScene(prev => ({ ...prev, setting: result.settingDescription || '' }));
            toast({ variant: 'success', title: "Cenário preenchido com base na imagem!" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Análise", description: error.message });
        } finally {
            setLoading('analyzingScenario', false);
        }
    };
    
    const generateSceneActionHandler = async () => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!currentScene.setting) return toast({ variant: 'destructive', title: "Cenário em falta", description: "Escreva uma descrição do cenário para gerar uma ação." });
        
        setLoading('generatingAction', true);
        try {
            const result = await generateSceneAction({
                sceneSetting: currentScene.setting,
            });
            setCurrentScene(prev => ({ ...prev, action: result.sceneAction || '' }));
            toast({ variant: 'success', title: "Ação principal gerada com sucesso!" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Geração da Ação", description: error.message });
        } finally {
            setLoading('generatingAction', false);
        }
    };
    
    const generateSceneTitleHandler = async () => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!currentScene.setting || !currentScene.action) return toast({ variant: 'destructive', title: "Dados em falta", description: "Escreva uma descrição do cenário e da ação para gerar um título." });
        
        setLoading('generatingTitle', true);
        try {
            const result = await generateSceneTitle({
                sceneSetting: currentScene.setting,
                sceneAction: currentScene.action,
            });
            setCurrentScene(prev => ({ ...prev, title: result.sceneTitle || '' }));
            toast({ variant: 'success', title: "Título da cena gerado com sucesso!" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Geração do Título", description: error.message });
        } finally {
            setLoading('generatingTitle', false);
        }
    };

    const generateSceneDialogueHandler = async () => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
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
            toast({ variant: 'success', title: "Diálogo gerado com sucesso!" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Geração do Diálogo", description: error.message });
        } finally {
            setLoading('generatingDialogue', false);
        }
    };

    const analyzeAndDescribeProduct = async () => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!currentScene.productImagePreview) return toast({ variant: 'destructive', title: "Imagem em falta", description: "Selecione uma imagem de produto." });
        setLoading('analyzingProduct', true);
        try {
            const result = await analyzeProductImage({
                productImageDataUri: currentScene.productImagePreview,
            });
            setCurrentScene(prev => ({ 
                ...prev, 
                productName: result.productName ?? prev.productName,
                productBrand: result.productBrand ?? prev.productBrand,
                productDescription: result.productDescription || '' 
            }));
            toast({ variant: 'success', title: "Análise do produto concluída!" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Análise", description: error.message });
        } finally {
            setLoading('analyzingProduct', false);
        }
    };

    const generateSceneContent = async (sceneToGenerate: Scene) => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!influencer.id) return toast({ variant: 'destructive', title: "Influenciador em falta", description: "Carregue ou crie e guarde um influenciador primeiro." });
        if (!sceneToGenerate.setting) return toast({ variant: 'destructive', title: "Cenário em falta", description: "O campo 'Cenário' é obrigatório na cena." });
        
        setLoading('generatingScript', true);
        setGeneratedContent('');
        
        try {
            const fullAppearance = `${influencer.appearance} Clothing: ${influencer.clothing}`;
            const responseText = await generateVideoScript({
                influencerName: influencer.name,
                influencerPersonality: influencer.personality,
                influencerAppearance: fullAppearance,
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
            
            toast({ variant: 'success', title: "Roteiro em Markdown gerado com sucesso!" });
        } catch (error: any) {
            setGeneratedContent(`**Falha ao gerar roteiro:**\n\n${error.message}`);
            toast({ variant: 'destructive', title: "Erro na Geração do Roteiro", description: error.message });
        } finally {
            setLoading('generatingScript', false);
        }
    };
    
    const generateVeoPromptHandler = async () => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!influencer.id) return toast({ variant: 'destructive', title: "Influenciador em falta", description: "Carregue ou crie e guarde um influenciador primeiro." });
        if (!currentScene.setting) return toast({ variant: 'destructive', title: "Cenário em falta", description: "O campo 'Cenário' é obrigatório na cena." });
        
        setLoading('generatingVeoPrompt', true);
        setGeneratedVeoPrompt('');
        try {
            const fullAppearance = `${influencer.appearance} Clothing: ${influencer.clothing}`;
            const result = await generateVeoPrompt({
                influencerAppearance: fullAppearance,
                sceneSetting: currentScene.setting,
                sceneAction: currentScene.action,
                sceneDialogue: currentScene.dialogue,
                sceneCameraAngle: currentScene.cameraAngle,
                videoFormat: currentScene.videoFormat,
            });
            
            setGeneratedVeoPrompt(result.veoPrompt);
            toast({ variant: 'success', title: "Prompt para Veo gerado com sucesso!" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro na Geração do Prompt Veo", description: error.message });
        } finally {
            setLoading('generatingVeoPrompt', false);
        }
    };

    const generateDialogueSeo = async () => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!currentScene.dialogue) return toast({ variant: 'destructive', title: "Diálogo em falta", description: "Escreva um diálogo na cena para gerar o SEO." });
        
        setLoading('generatingSeo', true);
        setGeneratedSeoContent('');
        try {
            const responseText = await generateSeoForPlatforms({
                dialogue: currentScene.dialogue,
            });
            setGeneratedSeoContent(responseText);
            toast({ variant: 'success', title: "SEO gerado com sucesso!" });
        } catch (error: any) {
            setGeneratedSeoContent(`**Falha ao gerar SEO:**\n\n${error.message}`);
            toast({ variant: 'destructive', title: "Erro na Geração de SEO", description: error.message });
        } finally {
            setLoading('generatingSeo', false);
        }
    };

    const handleAnalyzeYouTubeVideo = async () => {
        // This functionality is temporarily disabled as it relies on a more complex backend setup
        toast({ variant: 'destructive', title: "Funcionalidade Indisponível", description: "A análise de vídeos do YouTube está temporariamente desativada." });
    };

    const handleTranscribeUploadedVideo = async (videoDataUri: string) => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!videoDataUri) return toast({ variant: 'destructive', title: "Ficheiro em falta", description: "Por favor, anexe um ficheiro de vídeo." });

        setLoading('transcribingUploadedVideo', true);
        setGeneratedUploadedVideoTranscription('');
        setGeneratedViralScene(null);
        try {
            const result = await transcribeUploadedVideo({ videoDataUri });
            setGeneratedUploadedVideoTranscription(result.transcription);
            toast({ variant: 'success', title: "Transcrição concluída com sucesso!" });
        } catch (error: any) {
            console.error("Failed to transcribe uploaded video:", error);
            toast({ variant: 'destructive', title: "Erro na Transcrição", description: error.message });
        } finally {
            setLoading('transcribingUploadedVideo', false);
        }
    };

    const handleGenerateScriptFromTranscription = async (imageDataUri?: string) => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!generatedUploadedVideoTranscription) return toast({ variant: 'destructive', title: "Transcrição em falta", description: "Primeiro, transcreva um vídeo." });

        setLoading('generatingScriptFromTranscription', true);
        setGeneratedViralScene(null);
        try {
            const result = await generateScriptFromTranscription({ 
                transcription: generatedUploadedVideoTranscription,
                imageDataUri: imageDataUri
            });
            const newScene: Scene = {
                ...initialSceneState,
                ...result,
                id: nanoid(),
                duration: '8 seg', // Default duration as it's not known from transcription alone
            };

            setScenes(prev => [newScene, ...prev]);
            setGeneratedViralScene(newScene);
            
            toast({ variant: 'success', title: "Roteiro criado a partir da transcrição!", description: `A cena "${newScene.title}" foi gerada abaixo e guardada na sua galeria.` });

        } catch (error: any) {
            console.error("Failed to generate script from transcription:", error);
            toast({ variant: 'destructive', title: "Erro na Geração", description: error.message });
        } finally {
            setLoading('generatingScriptFromTranscription', false);
        }
    };

    const handleGenerateParaphrasedScriptFromTranscription = async (imageDataUri?: string) => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!generatedUploadedVideoTranscription) return toast({ variant: 'destructive', title: "Transcrição em falta", description: "Primeiro, transcreva um vídeo." });

        setLoading('generatingParaphrasedScriptFromTranscription', true);
        setGeneratedViralScene(null);
        try {
            const result = await generateParaphrasedScriptFromTranscription({ 
                transcription: generatedUploadedVideoTranscription,
                imageDataUri: imageDataUri,
            });
            const newScene: Scene = {
                ...initialSceneState,
                ...result,
                id: nanoid(),
                duration: '8 seg', // Default duration
            };

            setScenes(prev => [newScene, ...prev]);
            setGeneratedViralScene(newScene);
            
            toast({ variant: 'success', title: "Roteiro reescrito com sucesso!", description: `A nova cena "${newScene.title}" foi gerada e guardada na sua galeria.` });

        } catch (error: any) {
            console.error("Failed to generate paraphrased script:", error);
            toast({ variant: 'destructive', title: "Erro na Geração", description: error.message });
        } finally {
            setLoading('generatingParaphrasedScriptFromTranscription', false);
        }
    };

    const handleGenerateThumbnailIdeas = async (mainImageDataUri: string, backgroundImageDataUri: string | undefined, videoTheme: string, thumbnailStyle: ThumbnailStyle) => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!mainImageDataUri || !videoTheme) {
            return toast({ variant: 'destructive', title: "Informação em falta", description: "Por favor, carregue la imagem principal e preencha o tema do vídeo." });
        }
        
        setLoading('generatingThumbnail', true);
        setGeneratedThumbnailIdeas(null);
        try {
            const result = await generateThumbnailIdeas({ mainImageDataUri, backgroundImageDataUri, videoTheme, thumbnailStyle });
            setGeneratedThumbnailIdeas(result);
            toast({ variant: 'success', title: "Ideias para thumbnail geradas!" });
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
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        setLoading('generatingQuickScene', true);
        setGeneratedQuickScene(null);
        try {
            const result = await generateQuickScene({
                influencerPersonality: selectedInfluencerForQuickScene.personality,
                influencerNiche: selectedInfluencerForQuickScene.niche,
                influencerAppearance: selectedInfluencerForQuickScene.appearance,
                negativePrompt: selectedInfluencerForQuickScene.negativePrompt,
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
            toast({ variant: 'success', title: "Cena rápida gerada com sucesso!" });
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro ao gerar cena", description: error.message });
        } finally {
            setLoading('generatingQuickScene', false);
        }
    };

    const handleSaveAndLoadQuickScene = async () => {
        if (!generatedQuickScene || !selectedInfluencerForQuickScene) return;
        
        const sceneToSave = { ...generatedQuickScene, id: nanoid() };
        setScenes(prev => [sceneToSave, ...prev]);

        setInfluencer(selectedInfluencerForQuickScene);
        setCurrentScene(sceneToSave);
        
        setActiveView('creator');
        setIsQuickSceneModalOpen(false);
        toast({ variant: 'info', title: "Cena salva e carregada no editor!" });
    };

    const handleGenerateViralScript = async (videoTitle: string, imageDataUri: string | null, duration: string, videoType: 'shorts' | 'watch', cta: string | undefined) => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!videoTitle.trim()) return toast({ variant: 'destructive', title: "Informação em falta", description: "É preciso um tema para o roteiro." });

        setLoading('generatingViralScript', true);
        setGeneratedViralScene(null);
        try {
            const result = await generateViralScript({ 
                videoTitle, 
                imageDataUri: imageDataUri || undefined,
                duration, 
                videoType,
                cta,
            });

            const newScene: Scene = {
                ...initialSceneState,
                ...result,
                id: nanoid(),
                duration: duration,
            };

            setScenes(prev => [newScene, ...prev]);
            setGeneratedViralScene(newScene);

            toast({ 
                variant: 'success',
                title: "Roteiro viral gerado!", 
                description: `A cena "${newScene.title}" foi gerada abaixo e guardada na sua galeria.`,
            });

        } catch (error: any) {
            console.error("Failed to generate viral script:", error);
            toast({ variant: 'destructive', title: "Erro na Geração", description: error.message });
        } finally {
            setLoading('generatingViralScript', false);
        }
    };
    
    const handleLoadViralSceneToCreator = (scene: Scene) => {
        if (scene) {
            setCurrentScene(scene);
            setActiveView('creator');
            toast({ 
                variant: 'info',
                title: `Cena "${scene.title || 'sem título'}" carregada!`, 
                description: "A cena está pronta para ser editada ou usada para gerar um roteiro.",
            });
        }
    };

    const handleGenerateLongScript = async (videoTheme: string, duration: string, cameraAngle: string, influencerId?: string, sceneId?: string) => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!videoTheme.trim()) {
            return toast({ variant: 'destructive', title: 'Tema em Falta', description: 'Por favor, forneça um tema para o roteiro.' });
        }
        setLoading('generatingLongScript', true);
        setGeneratedLongScript(null);
        try {
            const influencerContext = galleryInfluencers.find(i => i.id === influencerId);
            const sceneContext = scenes.find(s => s.id === sceneId);

            const fullAppearance = influencerContext ? `${influencerContext.appearance} Clothing: ${influencerContext.clothing}` : undefined;
            
            const result = await generateLongScript({
                videoTheme,
                duration,
                influencerAppearance: fullAppearance,
                influencerAccent: influencerContext?.accent,
                influencerPersonality: influencerContext?.personality,
                influencerUniqueTrait: influencerContext?.uniqueTrait,
                influencerNegativePrompt: influencerContext?.negativePrompt,
                sceneSetting: sceneContext?.setting,
                sceneCameraAngle: cameraAngle,
            });
            setGeneratedLongScript(result);
            toast({ variant: 'success', title: 'Roteiro longo gerado com sucesso!' });
        } catch (error: any) {
            console.error('Failed to generate long script:', error);
            toast({ variant: 'destructive', title: 'Erro na Geração', description: error.message });
        } finally {
            setLoading('generatingLongScript', false);
        }
    };

    const handleGenerateWebDocScript = async (theme: string, duration: string, topics?: string) => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!theme.trim()) {
            return toast({ variant: 'destructive', title: 'Tema em Falta', description: 'Por favor, forneça um tema para o roteiro.' });
        }
        setLoading('generatingWebDoc', true);
        setGeneratedWebDocScript(null);
        setGeneratedWebDocSeo('');
        setGeneratedThumbnailFromWebDoc(null);
        try {
            const result = await generateWebDocScript({ theme, duration, topics });
            setGeneratedWebDocScript(result);
            toast({ variant: 'success', title: 'Roteiro para Web Doc gerado com sucesso!' });
        } catch (error: any) {
            console.error('Failed to generate web doc script:', error);
            toast({ variant: 'destructive', title: 'Erro na Geração', description: error.message });
        } finally {
            setLoading('generatingWebDoc', false);
        }
    };
    
    const handleExportWebDocScript = () => {
        if (!generatedWebDocScript) return;

        let content = `Title: ${generatedWebDocScript.title}\n\n`;
        content += generatedWebDocScript.scenes
            .map(scene => `----------\nSCENE ${scene.sceneNumber}\n\nSCRIPT (PT-BR):\n${scene.sceneScript}\n\nIMAGE PROMPT (EN):\n${scene.imagePrompt}\n\nVIDEO PROMPT (EN):\n${scene.videoPrompt}\n`)
            .join('\n');
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const fileName = `${generatedWebDocScript.title.replace(/ /g, '_')}_webdoc.txt`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ variant: 'success', title: `'${fileName}' exportado com sucesso!` });
    };

    const handleGenerateWebDocSeo = async () => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!generatedWebDocScript) {
            return toast({ variant: 'destructive', title: 'Roteiro em Falta', description: 'Gere um roteiro para o Web Doc primeiro.' });
        }

        const fullDialogue = generatedWebDocScript.scenes.map(scene => scene.sceneScript).join('\n');
        
        if (!fullDialogue.trim()) {
            return toast({ variant: 'destructive', title: 'Conteúdo em Falta', description: 'O roteiro gerado não tem diálogo para ser analisado.' });
        }
        
        setLoading('generatingWebDocSeo', true);
        setGeneratedWebDocSeo('');
        try {
            const seoResult = await generateSeoForPlatforms({ dialogue: fullDialogue });
            setGeneratedWebDocSeo(seoResult);
            toast({ variant: 'success', title: 'SEO para o Web Doc gerado com sucesso!' });
        } catch (error: any) {
            console.error('Failed to generate web doc SEO:', error);
            toast({ variant: 'destructive', title: 'Erro na Geração de SEO', description: error.message });
        } finally {
            setLoading('generatingWebDocSeo', false);
        }
    };
    
    const handleGenerateImageForWebDoc = async (prompt: string) => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        setLoading('generatingWebDocImage', true);
        setGeneratedImageForPopup(null);
        setActivePromptForImageGen(prompt);
        setIsImagePreviewModalOpen(true);
        try {
            const result = await generateImageFromPrompt({ prompt });
            setGeneratedImageForPopup(result.imageDataUri);
        } catch (error: any) {
            console.error('Failed to generate image for web doc:', error);
            toast({ variant: 'destructive', title: 'Erro na Geração da Imagem', description: error.message });
            setIsImagePreviewModalOpen(false); // Close modal on error
        } finally {
            setLoading('generatingWebDocImage', false);
        }
    };
    
    const handleGenerateImageFromPastedScript = async (prompt: string) => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        setLoading('generatingImageFromPastedScript', true);
        setGeneratedImageForPopup(null);
        setActivePromptForImageGen(prompt);
        setIsImagePreviewModalOpen(true);
        try {
            const result = await generateImageFromPrompt({ prompt });
            setGeneratedImageForPopup(result.imageDataUri);
        } catch (error: any) {
            console.error('Failed to generate image from pasted script:', error);
            toast({ variant: 'destructive', title: 'Erro na Geração da Imagem', description: error.message });
            setIsImagePreviewModalOpen(false); // Close modal on error
        } finally {
            setLoading('generatingImageFromPastedScript', false);
        }
    };

    const handleGeneratePromptsFromScript = async () => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!pastedScript.trim()) {
            return toast({ variant: 'destructive', title: 'Roteiro em Falta', description: 'Por favor, cole um roteiro para gerar os prompts.' });
        }
        setLoading('generatingImagePrompts', true);
        setGeneratedScenePrompts(null);
        setGeneratedSeoFromScript('');
        try {
            const result = await generatePromptsFromScript({ scriptText: pastedScript });
            setGeneratedScenePrompts(result.prompts);
            toast({ variant: 'success', title: 'Prompts de imagem gerados com sucesso!' });
        } catch (error: any) {
            console.error('Failed to generate image prompts from script:', error);
            toast({ variant: 'destructive', title: 'Erro na Geração', description: error.message });
        } finally {
            setLoading('generatingImagePrompts', false);
        }
    };

    const handleGenerateSeoFromScript = async () => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!pastedScript.trim()) {
            return toast({ variant: 'destructive', title: 'Roteiro em Falta', description: 'O roteiro precisa estar colado para gerar o SEO.' });
        }
        setLoading('generatingSeoFromScript', true);
        setGeneratedSeoFromScript('');
        try {
            const result = await generateSeoFromScript({ scriptText: pastedScript });
            setGeneratedSeoFromScript(result);
            toast({ variant: 'success', title: 'SEO gerado a partir do roteiro!' });
        } catch (error: any) {
            console.error('Failed to generate SEO from script:', error);
            toast({ variant: 'destructive', title: 'Erro na Geração de SEO', description: error.message });
        } finally {
            setLoading('generatingSeoFromScript', false);
        }
    };

    const handleGenerateThumbnailFromScript = async () => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!pastedScript.trim()) {
            return toast({ variant: 'destructive', title: 'Roteiro em Falta', description: 'Por favor, cole um roteiro para gerar a thumbnail.' });
        }
        setLoading('generatingThumbnailFromScript', true);
        setGeneratedThumbnailFromScript(null);
        try {
            const result = await generateThumbnailFromScript({ scriptText: pastedScript });
            setGeneratedThumbnailFromScript(result);
            toast({ variant: 'success', title: 'Ideias de thumbnail geradas com sucesso!' });
        } catch (error: any) {
            console.error('Failed to generate thumbnail from script:', error);
            toast({ variant: 'destructive', title: 'Erro na Geração da Thumbnail', description: error.message });
        } finally {
            setLoading('generatingThumbnailFromScript', false);
        }
    };

    const handleGenerateThumbnailFromWebDoc = async () => {
        if (!isApiConfigured) return setIsLoginModalOpen(true);
        if (!generatedWebDocScript) {
             return toast({ variant: 'destructive', title: 'Roteiro em Falta', description: 'Por favor, gere um roteiro para Web Doc primeiro.' });
        }

        const fullScript = generatedWebDocScript.scenes.map(s => s.sceneScript).join('\n\n');
        if (!fullScript.trim()) {
             return toast({ variant: 'destructive', title: 'Roteiro Vazio', description: 'O roteiro gerado não tem conteúdo para criar uma thumbnail.' });
        }

        setLoading('generatingThumbnailFromWebDoc', true);
        setGeneratedThumbnailFromWebDoc(null);
        try {
            const result = await generateThumbnailFromScript({ scriptText: fullScript });
            setGeneratedThumbnailFromWebDoc(result);
            toast({ variant: 'success', title: 'Ideias de thumbnail geradas com sucesso para o Web Doc!' });
        } catch (error: any) {
            console.error('Failed to generate thumbnail from web doc script:', error);
            toast({ variant: 'destructive', title: 'Erro na Geração da Thumbnail', description: error.message });
        } finally {
            setLoading('generatingThumbnailFromWebDoc', false);
        }
    };

    const handleExportPrompts = () => {
        if (!generatedScenePrompts) return;

        let content = "Prompts Gerados a partir do Roteiro\n\n";
        content += generatedScenePrompts.map(p => 
            `----------\nSCENE ${p.sceneNumber}\n\nIMAGE PROMPT:\n${p.imagePrompt}\n\nVIDEO PROMPT:\n${p.videoPrompt}\n`
        ).join('\n');
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'prompts_de_cena.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ variant: 'success', title: 'Prompts exportados com sucesso!' });
    };

    // DB Handlers (now local state handlers)
    const saveOrUpdateInfluencer = () => {
        const requiredFields: Array<keyof Influencer> = ['name', 'niche', 'personality', 'appearance', 'clothing', 'bio', 'uniqueTrait', 'age', 'gender', 'accent'];
        
        const missingFields = requiredFields.filter(field => {
            const value = influencer[field];
            return typeof value === 'string' ? !value.trim() : !value;
        });

        if (missingFields.length > 0) {
            toast({
                variant: 'destructive',
                title: 'Campos em Falta',
                description: `Por favor, preencha os seguintes campos: ${missingFields.join(', ')}.`
            });
            return;
        }

        setLoading('savingInfluencer', true);
        
        if (influencer.id) {
            const updatedInfluencer = { ...influencer, created_at: new Date().toISOString() };
            setGalleryInfluencers(prev => prev.map(inf => inf.id === updatedInfluencer.id ? updatedInfluencer : inf));
            toast({ variant: 'success', title: "Influenciador atualizado!" });
        } else {
            const newInfluencer = { ...influencer, id: nanoid(), created_at: new Date().toISOString() };
            setGalleryInfluencers(prev => [newInfluencer, ...prev]);
            setInfluencer(newInfluencer);
            toast({ variant: 'success', title: "Influenciador adicionado à galeria!" });
        }
        
        setLoading('savingInfluencer', false);
    };
    
    const deleteInfluencerHandler = (idToDelete: string) => {
        setGalleryInfluencers(prev => prev.filter(inf => inf.id !== idToDelete));
        toast({ title: "Influenciador excluído!" });
        if (influencer.id === idToDelete) {
            setInfluencer(getInitialInfluencerState());
        }
    };
    
    const loadInfluencer = (id: string) => {
        const influencerToLoad = galleryInfluencers.find(inf => inf.id === id);
        if (influencerToLoad) {
            setInfluencer(influencerToLoad);
            setActiveView('creator');
            toast({ variant: 'info', title: `"${influencerToLoad.name}" carregado no editor!` });
        }
    };

    const handleAddUpdateScene = () => {
        if (!currentScene.setting && !currentScene.title) return toast({ variant: 'destructive', title: "Dados em falta", description: "Preencha pelo menos um título ou um cenário." });

        setLoading('savingScene', true);
        
        if (currentScene.id) {
            const updatedScene = { ...currentScene, created_at: new Date().toISOString() };
            setScenes(prev => prev.map(s => s.id === updatedScene.id ? updatedScene : s));
            toast({ variant: 'success', title: "Cena atualizada!" });
        } else {
            const newScene = { ...currentScene, id: nanoid(), created_at: new Date().toISOString() };
            setScenes(prev => [newScene, ...prev]);
            setCurrentScene(newScene);
            toast({ variant: 'success', title: "Cena adicionada!" });
        }
        setLoading('savingScene', false);
    };

    const deleteSceneHandler = (idToDelete: string) => {
        setScenes(prev => prev.filter(s => s.id !== idToDelete));
        toast({ title: "Cena excluída!" });
        if (currentScene.id === idToDelete) {
            setCurrentScene(initialSceneState);
        }
    };

    const loadScene = (id: string) => {
        const sceneToLoad = scenes.find(s => s.id === id);
        if (sceneToLoad) {
            setCurrentScene(sceneToLoad);
            setActiveView('creator');
            toast({ variant: 'info', title: `Cena "${sceneToLoad.title || 'sem título'}" carregada!` });
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

    const handleClearTranscription = () => {
        setGeneratedUploadedVideoTranscription('');
    };

    if (!hasMounted) {
        return <LoadingScreen />;
    }


    const renderContent = () => {
        switch (activeView) {
            case 'creator':
                return <CreatorView
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
                    />;
            case 'influencerGallery':
                 return <InfluencerGalleryView
                        influencers={galleryInfluencers}
                        onLoad={loadInfluencer}
                        onDelete={deleteInfluencerHandler}
                        onAddNew={handleAddNewInfluencer}
                        onQuickScene={handleOpenQuickSceneModal}
                    />;
            case 'sceneGallery':
                return <SceneGalleryView
                        scenes={scenes}
                        onLoad={loadScene}
                        onDelete={deleteSceneHandler}
                        onAddNew={handleAddNewScene}
                    />;
            case 'viralTools':
                return <ViralToolsView
                        isApiConfigured={isApiConfigured}
                        onGenerateViralScript={handleGenerateViralScript}
                        loadingViralScript={loadingStates.generatingViralScript}
                        generatedViralScene={generatedViralScene}
                        onLoadToCreator={handleLoadViralSceneToCreator}
                    />;
            case 'thumbnailGenerator':
                 return <ThumbnailGeneratorView
                        onGenerateThumbnail={handleGenerateThumbnailIdeas}
                        generatedThumbnailIdeas={generatedThumbnailIdeas}
                        loadingThumbnail={loadingStates.generatingThumbnail}
                        isApiConfigured={isApiConfigured}
                    />;
            case 'transcribeVideo':
                return <TranscribeVideoView
                    isApiConfigured={isApiConfigured}
                    youtubeUrl={youtubeUrl}
                    setYoutubeUrl={setYoutubeUrl}
                    loadingYouTube={loadingStates.analyzingYouTube}
                    onTranscribeUploadedVideo={handleTranscribeUploadedVideo}
                    loadingUploadedVideoTranscription={loadingStates.transcribingUploadedVideo}
                    generatedUploadedVideoTranscription={generatedUploadedVideoTranscription}
                    onGenerateScriptFromTranscription={handleGenerateScriptFromTranscription}
                    loadingScriptFromTranscription={loadingStates.generatingScriptFromTranscription}
                    onGenerateParaphrasedScriptFromTranscription={handleGenerateParaphrasedScriptFromTranscription}
                    loadingParaphrasedScript={loadingStates.generatingParaphrasedScriptFromTranscription}
                    onClearTranscription={handleClearTranscription}
                    generatedViralScene={generatedViralScene}
                    onLoadToCreator={handleLoadViralSceneToCreator}
                />;
            case 'advancedTools':
                return <AdvancedToolsView
                        influencers={galleryInfluencers}
                        scenes={scenes}
                        onGenerateLongScript={handleGenerateLongScript}
                        loadingLongScript={loadingStates.generatingLongScript}
                        generatedLongScript={generatedLongScript}
                        onGenerateWebDocScript={handleGenerateWebDocScript}
                        loadingWebDoc={loadingStates.generatingWebDoc}
                        generatedWebDocScript={generatedWebDocScript}
                        onExportWebDocScript={handleExportWebDocScript}
                        onGenerateWebDocSeo={handleGenerateWebDocSeo}
                        loadingWebDocSeo={loadingStates.generatingWebDocSeo}
                        generatedWebDocSeo={generatedWebDocSeo}
                        pastedScript={pastedScript}
                        setPastedText={setPastedScript}
                        onGeneratePromptsFromScript={handleGeneratePromptsFromScript}
                        loadingImagePrompts={loadingStates.generatingImagePrompts}
                        generatedScenePrompts={generatedScenePrompts}
                        onGenerateSeoFromScript={handleGenerateSeoFromScript}
                        loadingSeoFromScript={loadingStates.generatingSeoFromScript}
                        generatedSeoFromScript={generatedSeoFromScript}
                        onGenerateThumbnailFromScript={handleGenerateThumbnailFromScript}
                        loadingThumbnailFromScript={loadingStates.generatingThumbnailFromScript}
                        generatedThumbnailFromScript={generatedThumbnailFromScript}
                        onExportPrompts={handleExportPrompts}
                        onGenerateThumbnailFromWebDoc={handleGenerateThumbnailFromWebDoc}
                        loadingThumbnailFromWebDoc={loadingStates.generatingThumbnailFromWebDoc}
                        generatedThumbnailFromWebDoc={generatedThumbnailFromWebDoc}
                        isApiConfigured={isApiConfigured}
                        onGenerateImageForWebDoc={handleGenerateImageForWebDoc}
                        loadingWebDocImage={loadingStates.generatingWebDocImage}
                        onGenerateImageFromPastedScript={handleGenerateImageFromPastedScript}
                        loadingImageFromPastedScript={loadingStates.generatingImageFromPastedScript}
                    />;
            case 'bento':
            default:
                return <BentoGrid setView={setActiveView} />;
        }
    }

    return (
        <div suppressHydrationWarning>
             <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSave={handleApiKeySave}
            />
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
            <ImagePreviewModal
                isOpen={isImagePreviewModalOpen}
                onClose={() => setIsImagePreviewModalOpen(false)}
                imageDataUri={generatedImageForPopup}
                loading={loadingStates.generatingWebDocImage || loadingStates.generatingImageFromPastedScript}
                prompt={activePromptForImageGen}
            />


            <AppHeader isApiConfigured={isApiConfigured} onOpenLoginModal={() => setIsLoginModalOpen(true)} />
            
            <PromoBanner hasPurchased={hasPurchased} />

            {activeView !== 'bento' && (
                <Button variant="ghost" onClick={() => setActiveView('bento')} className="mb-6">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o Início
                </Button>
            )}

            <div className="w-full">
                {renderContent()}
            </div>
        </div>
    );
}

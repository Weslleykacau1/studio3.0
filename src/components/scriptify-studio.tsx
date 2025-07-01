'use client';

import { useState, useEffect, useCallback } from 'react';

import type { Influencer, Scene, ActiveView, LoadingStates, ApiKeyStatus } from '@/types';
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
import { getAllInfluencers, saveInfluencer, deleteInfluencerDB, getAllScenes, saveScene, deleteSceneDB } from '@/lib/idb';

import { AppHeader } from './app-header';
import { LoginModal } from './login-modal';
import CreatorView from './views/creator-view';
import InfluencerGalleryView from './views/influencer-gallery-view';
import SceneGalleryView from './views/scene-gallery-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Film, Palette, LayoutGrid } from 'lucide-react';

const getInitialInfluencerState = (): Influencer => ({ id: null, name: '', niche: '', personality: '', appearance: '', bio: '', uniqueTrait: '', negativePrompt: '', age: '', gender: '', accent: '', imagePreview: '', seed: Math.floor(Math.random() * 1000000) });
const initialSceneState: Scene = { id: null, title: '', setting: '', action: '', dialogue: '', cameraAngle: 'Vlog (Conversacional)', duration: '5 seg', videoFormat: '9:16 (Vertical)', productName: '', productBrand: '', productDescription: '', productImagePreview: '', productImageType: '', isPartnership: false, scenarioImagePreview: '', scenarioImageType: '', allowDigitalText: false, onlyPhysicalText: false, };

export default function ScriptifyStudio() {
    const [activeView, setActiveView] = useState<ActiveView>('creator');
    const [userApiKey, setUserApiKey] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>('idle');
    const [lastApiKeyCheck, setLastApiKeyCheck] = useState<string | null>(null);
    
    const [influencer, setInfluencer] = useState<Influencer>(getInitialInfluencerState());
    const [galleryInfluencers, setGalleryInfluencers] = useState<Influencer[]>([]);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [currentScene, setCurrentScene] = useState<Scene>(initialSceneState);
    const [generatedContent, setGeneratedContent] = useState('');
    const [generatedSeoContent, setGeneratedSeoContent] = useState('');

    const [loadingStates, setLoadingStates] = useState<LoadingStates>({ savingInfluencer: false, savingScene: false, analyzingInfluencer: false, analyzingScenario: false, analyzingProduct: false, generatingScript: false, analyzingFromText: false, testingApi: false, generatingSeo: false, generatingAction: false, generatingTitle: false });
    const [pastedText, setPastedText] = useState('');
    const [outputFormat, setOutputFormat] = useState('json');
    const { toast } = useToast();
    const [hasMounted, setHasMounted] = useState(false);

    const testApiKey = useCallback(async (key: string) => {
        setApiKeyStatus('testing');
        try {
            const payload = { contents: [{ role: 'user', parts: [{ text: 'hello' }] }] };
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                }
            );
            const result = await response.json();
            if (response.ok && result.candidates) {
                setApiKeyStatus('valid');
                setLastApiKeyCheck(new Date().toISOString());
                return true;
            } else {
                setApiKeyStatus('invalid');
                setLastApiKeyCheck(null);
                toast({ variant: 'destructive', title: "Chave API Inválida", description: "A chave API guardada não está a funcionar." });
                return false;
            }
        } catch (error) {
            console.error('Erro no teste da API:', error);
            setApiKeyStatus('invalid');
            setLastApiKeyCheck(null);
            toast({ variant: 'destructive', title: "Erro de Rede", description: "Não foi possível verificar a chave API." });
            return false;
        }
    }, [toast]);
    
    // Load from localStorage/IndexedDB on mount
    useEffect(() => {
        setHasMounted(true);
        const savedApiKey = localStorage.getItem('geminiApiKey');
        if (savedApiKey) {
            setUserApiKey(savedApiKey);
            setIsLoggedIn(true);
            testApiKey(savedApiKey);
        }

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
    }, [toast, testApiKey]);

    const setLoading = (key: keyof LoadingStates, value: boolean) => {
        setLoadingStates(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveApiKey = (key: string) => {
        setUserApiKey(key);
        localStorage.setItem('geminiApiKey', key);
        setIsLoggedIn(true);
        setApiKeyStatus('valid');
        setLastApiKeyCheck(new Date().toISOString());
        setIsLoginModalOpen(false);
        toast({ title: "Chave API guardada e verificada!", className: "bg-green-100 text-green-800" });
    };

    const handleRemoveApiKey = () => {
        setUserApiKey('');
        localStorage.removeItem('geminiApiKey');
        setIsLoggedIn(false);
        setApiKeyStatus('idle');
        setLastApiKeyCheck(null);
        toast({ title: "Chave API removida." });
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
        const { dismiss: dismissToast, update: updateToast } = toast({
          title: 'A iniciar geração...',
          description: 'A preparar para gerar o prompt.',
        });

        try {
            await new Promise(res => setTimeout(res, 700));
            updateToast({ title: 'A analisar traços do influenciador...', description: 'A IA está a ler o perfil do seu influenciador.' });

            await new Promise(res => setTimeout(res, 700));
            updateToast({ title: 'A interpretar detalhes da cena...', description: 'A IA está a analisar o cenário e a ação.' });

            await new Promise(res => setTimeout(res, 700));
            updateToast({ title: 'A construir o prompt para a IA...', description: 'Quase pronto! A formatar as instruções finais.' });
            
            const responseText = await generateVideoScript({
                influencerName: influencer.name,
                influencerPersonality: influencer.personality,
                influencerAppearance: influencer.appearance,
                influencerNiche: influencer.niche,
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
                outputFormat: outputFormat as "json" | "markdown",
            });
            
            updateToast({ title: 'A formatar o resultado final...', description: 'A preparar a visualização do prompt gerado.' });
            await new Promise(res => setTimeout(res, 500));
            
            if (outputFormat === 'json') {
                try {
                    const parsedResponse = JSON.parse(responseText);
                    const promptContent = parsedResponse.prompt || '';
                    setGeneratedContent(`\`\`\`text\n${promptContent.trim()}\n\`\`\``);
                } catch (error) {
                    console.error("Failed to parse JSON response from API:", error);
                    throw new Error("A API retornou um prompt com formato JSON inválido.");
                }
            } else {
                setGeneratedContent(responseText);
            }
            setActiveView('creator');
            dismissToast();
            toast({ title: "Prompt gerado com sucesso!", className: "bg-green-100 text-green-800" });
        } catch (error: any) {
            setGeneratedContent(`**Falha ao gerar prompt:**\n\n${error.message}`);
            dismissToast();
            toast({ variant: 'destructive', title: "Erro na Geração do Prompt", description: error.message });
        } finally {
            setLoading('generatingScript', false);
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

    // IndexedDB Handlers
    const saveOrUpdateInfluencer = async () => {
        if (!influencer.name) {
            return toast({ variant: 'destructive', title: "Campo em falta", description: "Por favor, preencha o campo: nome." });
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
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSave={handleSaveApiKey}
            />

            <AppHeader
                isLoggedIn={isLoggedIn}
                onLoginClick={() => setIsLoginModalOpen(true)}
                onRemoveApiKey={handleRemoveApiKey}
                apiKeyStatus={apiKeyStatus}
                lastApiKeyCheck={lastApiKeyCheck}
            />

            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ActiveView)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-primary/10">
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
                </TabsList>

                <TabsContent value="creator" className="mt-6">
                    <CreatorView
                        influencer={influencer}
                        setInfluencer={setInfluencer}
                        currentScene={currentScene}
                        setCurrentScene={setCurrentScene}
                        pastedText={pastedText}
                        setPastedText={setPastedText}
                        outputFormat={outputFormat}
                        setOutputFormat={setOutputFormat}
                        generatedContent={generatedContent}
                        setGeneratedContent={setGeneratedContent}
                        generatedSeoContent={generatedSeoContent}
                        loadingStates={loadingStates}
                        isLoggedIn={isLoggedIn}
                        handlers={{
                            analyzeAndFillFromText,
                            analyzeInfluencerImageAndFill,
                            analyzeScenarioImageAndFill,
                            analyzeAndDescribeProduct,
                            generateSceneContent,
                            generateDialogueSeo,
                            generateSceneAction: generateSceneActionHandler,
                            generateSceneTitle: generateSceneTitleHandler,
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
            </Tabs>
        </div>
    );
}

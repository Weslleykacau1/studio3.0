'use client';

import { useState, useEffect, useRef } from 'react';
import { signInAnonymously, onAuthStateChanged, signInWithCustomToken, User } from 'firebase/auth';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, DocumentData } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

import type { Influencer, Scene, ActiveView, LoadingStates, InfluencerDocument, SceneDocument } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { formatTimeAgo, extractJson, handleImageUpload as handleImageUploadUtil } from '@/lib/utils';
import { analyzeTextProfile, AnalyzeTextProfileOutput } from '@/ai/flows/analyze-text-profile';
import { analyzeInfluencerImage, AnalyzeInfluencerImageOutput } from '@/ai/flows/analyze-influencer-image';
import { analyzeSceneBackground } from '@/ai/flows/analyze-scene-background';
import { analyzeProductImage } from '@/ai/flows/analyze-product-image';
import { generateVideoScript } from '@/ai/flows/generate-video-script';

import { AppHeader } from './app-header';
import { LoginModal } from './login-modal';
import CreatorView from './views/creator-view';
import InfluencerGalleryView from './views/influencer-gallery-view';
import SceneGalleryView from './views/scene-gallery-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Film, Palette, LayoutGrid, Bot } from 'lucide-react';

declare global {
  var __initial_auth_token: string | undefined;
  var __app_id: string | undefined;
}

const initialInfluencerState: Influencer = { id: null, name: '', niche: '', personality: '', appearance: '', bio: '', uniqueTrait: '', negativePrompt: '', age: '', gender: '', accent: '', imagePreview: '' };
const initialSceneState: Scene = { id: null, title: '', setting: '', action: '', dialogue: '', cameraAngle: 'Vlog (Conversacional)', duration: '5 seg', videoFormat: '9:16 (Vertical)', productName: '', productBrand: '', productDescription: '', productImagePreview: '', productImageType: '', isPartnership: false, scenarioImagePreview: '', scenarioImageType: '', allowDigitalText: false, onlyPhysicalText: false, };

export default function ScriptifyStudio() {
    const [activeView, setActiveView] = useState<ActiveView>('creator');
    const [userApiKey, setUserApiKey] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    
    const [influencer, setInfluencer] = useState<Influencer>(initialInfluencerState);
    const [galleryInfluencers, setGalleryInfluencers] = useState<Influencer[]>([]);
    const [scenes, setScenes] = useState<Scene[]>([]);
    const [currentScene, setCurrentScene] = useState<Scene>(initialSceneState);
    const [generatedContent, setGeneratedContent] = useState('');

    const [loadingStates, setLoadingStates] = useState<LoadingStates>({ savingInfluencer: false, savingScene: false, analyzingInfluencer: false, analyzingScenario: false, analyzingProduct: false, generatingScript: false, analyzingFromText: false, testingApi: false });
    const [pastedText, setPastedText] = useState('');
    const [outputFormat, setOutputFormat] = useState('json');
    const [userId, setUserId] = useState<string | null>(null);
    const [appId, setAppId] = useState('default-app-id');
    const { toast } = useToast();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedApiKey = localStorage.getItem('geminiApiKey');
            if (savedApiKey) {
                setUserApiKey(savedApiKey);
                setIsLoggedIn(true);
            }
            setAppId(window.__app_id || 'default-app-id');
        }

        if (!auth || !db) {
            toast({ variant: 'destructive', title: 'Erro de Configuração', description: 'A configuração do Firebase não foi encontrada. Algumas funcionalidades podem não funcionar.' });
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    const initialAuthToken = window.__initial_auth_token;
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Firebase sign-in error:", error);
                    toast({ variant: 'destructive', title: 'Erro de Autenticação', description: 'Não foi possível autenticar com o Firebase.' });
                }
            }
        });
        return () => unsubscribe();
    }, [toast]);

    useEffect(() => {
        if (!db || !userId) return;

        const influencerCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'influencerGallery');
        const influencerUnsubscribe = onSnapshot(influencerCollectionRef, (snapshot) => {
            const influencersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Influencer));
            setGalleryInfluencers(influencersData);
        }, (error) => {
            console.error("Error fetching influencers:", error);
            toast({ variant: 'destructive', title: 'Erro de Sincronização', description: 'Não foi possível carregar os influenciadores.' });
        });

        const scenesCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'scenes');
        const scenesUnsubscribe = onSnapshot(scenesCollectionRef, (snapshot) => {
            const scenesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Scene));
            setScenes(scenesData);
        }, (error) => {
            console.error("Error fetching scenes:", error);
            toast({ variant: 'destructive', title: 'Erro de Sincronização', description: 'Não foi possível carregar as cenas.' });
        });

        return () => {
            influencerUnsubscribe();
            scenesUnsubscribe();
        };
    }, [db, userId, appId, toast]);


    const setLoading = (key: keyof LoadingStates, value: boolean) => {
        setLoadingStates(prev => ({ ...prev, [key]: value }));
    };

    const handleSaveApiKey = (key: string) => {
        setUserApiKey(key);
        localStorage.setItem('geminiApiKey', key);
        setIsLoggedIn(true);
        setIsLoginModalOpen(false);
        toast({ title: "Chave API guardada e verificada!", className: "bg-green-100 text-green-800" });
    };

    const handleRemoveApiKey = () => {
        setUserApiKey('');
        localStorage.removeItem('geminiApiKey');
        setIsLoggedIn(false);
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
            setInfluencer(prev => ({ ...prev, ...result }));
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
            setInfluencer(prev => ({ ...prev, ...result, imagePreview: photoDataUri }));
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
            
            if (outputFormat === 'json') {
                const parsedScript = extractJson(responseText);
                if (!parsedScript) throw new Error(`A API retornou um roteiro inválido.`);
                const formattedScript = JSON.stringify(parsedScript, null, 2);
                setGeneratedContent(`\`\`\`json\n${formattedScript}\n\`\`\``);
            } else {
                setGeneratedContent(responseText);
            }
            setActiveView('creator');
            toast({ title: "Roteiro gerado com sucesso!", className: "bg-green-100 text-green-800" });
        } catch (error: any) {
            setGeneratedContent(`**Falha ao gerar conteúdo:**\n\n${error.message}`);
            toast({ variant: 'destructive', title: "Erro na Geração", description: error.message });
        } finally {
            setLoading('generatingScript', false);
        }
    };

    // Firebase Handlers
    const saveOrUpdateInfluencer = async () => {
        if (!db || !userId) return toast({ variant: 'destructive', title: "Erro de Base de Dados" });
        if (!influencer.name) {
            return toast({ variant: 'destructive', title: "Campo em falta", description: "Por favor, preencha o campo: nome." });
        }

        setLoading('savingInfluencer', true);
        const { id, ...dataToSave } = influencer;
        const docData: InfluencerDocument = dataToSave;

        try {
            if (id) {
                const docRef = doc(db, 'artifacts', appId, 'users', userId, 'influencerGallery', id);
                await updateDoc(docRef, docData);
                toast({ title: "Influenciador atualizado com sucesso!", className: "bg-green-100 text-green-800" });
            } else {
                const collectionRef = collection(db, 'artifacts', appId, 'users', userId, 'influencerGallery');
                const newDoc = await addDoc(collectionRef, docData);
                setInfluencer(prev => ({...prev, id: newDoc.id }));
                toast({ title: "Influenciador adicionado à galeria!", className: "bg-green-100 text-green-800" });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro ao Guardar", description: error.message });
        } finally {
            setLoading('savingInfluencer', false);
        }
    };
    
    const deleteInfluencer = async (idToDelete: string) => {
        if (!db || !userId) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'influencerGallery', idToDelete));
            toast({ title: "Influenciador excluído!" });
            if (influencer.id === idToDelete) {
                setInfluencer(initialInfluencerState);
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro ao Excluir", description: error.message });
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
        if (!db || !userId) return toast({ variant: 'destructive', title: "Erro de Base de Dados" });
        if (!currentScene.setting) return toast({ variant: 'destructive', title: "Cenário em falta", description: "O campo 'Cenário' é obrigatório." });

        setLoading('savingScene', true);
        const { id, ...data } = currentScene;
        const sceneToSave: SceneDocument = data;

        try {
            if (id) {
                await updateDoc(doc(db, 'artifacts', appId, 'users', userId, 'scenes', id), sceneToSave);
                toast({ title: "Cena atualizada com sucesso!", className: "bg-green-100 text-green-800" });
            } else {
                const newDoc = await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'scenes'), sceneToSave);
                setCurrentScene(prev => ({ ...prev, id: newDoc.id }));
                toast({ title: "Cena adicionada com sucesso!", className: "bg-green-100 text-green-800" });
            }
        } catch (error: any) {
             toast({ variant: 'destructive', title: "Erro ao Guardar Cena", description: error.message });
        } finally {
            setLoading('savingScene', false);
        }
    };

    const deleteScene = async (idToDelete: string) => {
        if (!db || !userId) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'scenes', idToDelete));
            toast({ title: "Cena excluída!" });
            if (currentScene.id === idToDelete) {
                setCurrentScene(initialSceneState);
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Erro ao Excluir Cena", description: error.message });
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


    return (
        <>
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSave={handleSaveApiKey}
            />

            <AppHeader
                isLoggedIn={isLoggedIn}
                onLoginClick={() => setIsLoginModalOpen(true)}
                onRemoveApiKey={handleRemoveApiKey}
            />

            <Tabs value={activeView} onValueChange={(value) => setActiveView(value as ActiveView)} className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-primary/10">
                    <TabsTrigger value="creator"><Film className="mr-2 h-4 w-4" />Criador</TabsTrigger>
                    <TabsTrigger value="influencerGallery"><Palette className="mr-2 h-4 w-4" />Galeria de Influenciadores</TabsTrigger>
                    <TabsTrigger value="sceneGallery"><LayoutGrid className="mr-2 h-4 w-4" />Galeria de Cenas</TabsTrigger>
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
                        loadingStates={loadingStates}
                        isLoggedIn={isLoggedIn}
                        handlers={{
                            analyzeAndFillFromText,
                            analyzeInfluencerImageAndFill,
                            analyzeScenarioImageAndFill,
                            analyzeAndDescribeProduct,
                            generateSceneContent,
                            saveOrUpdateInfluencer,
                            handleAddUpdateScene,
                            handleImageUpload,
                            resetInfluencer: () => setInfluencer(initialInfluencerState),
                            resetScene: () => setCurrentScene(initialSceneState),
                        }}
                    />
                </TabsContent>
                <TabsContent value="influencerGallery" className="mt-6">
                    <InfluencerGalleryView
                        influencers={galleryInfluencers}
                        onLoad={loadInfluencer}
                        onDelete={deleteInfluencer}
                    />
                </TabsContent>
                <TabsContent value="sceneGallery" className="mt-6">
                    <SceneGalleryView
                        scenes={scenes}
                        onLoad={loadScene}
                        onDelete={deleteScene}
                        onGenerateScript={generateSceneContent}
                        isGenerationDisabled={!influencer.id}
                    />
                </TabsContent>
            </Tabs>
        </>
    );
}

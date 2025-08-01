
'use client';

import { useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { Influencer, Scene, LoadingStates, ActiveView, ThumbnailIdeas, ThumbnailStyle, LongScriptScene, WebDocScript, ScenePrompts } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from './app-header';
import { LoginModal } from './login-modal';
import { QuickSceneModal } from './quick-scene-modal';
import { ImagePreviewModal } from './image-preview-modal';
import { LoadingScreen } from './loading-screen';
import { PromoBanner } from './promo-banner';
import BentoGrid from './views/bento-grid-view';
import CreatorView from './views/creator-view';
import InfluencerGalleryView from './views/influencer-gallery-view';
import SceneGalleryView from './views/scene-gallery-view';
import ViralToolsView from './views/viral-tools-view';
import AdvancedToolsView from './views/advanced-tools-view';
import ThumbnailGeneratorView from './views/thumbnail-generator-view';
import TranscribeVideoView from './views/transcribe-video-view';
import { handleImageUpload } from '@/lib/utils';
import { Button } from './ui/button';
import { ChevronLeft } from 'lucide-react';


// AI Flow imports
import { analyzeInfluencerImage } from '@/ai/flows/analyze-influencer-image';
import { analyzeSceneBackground } from '@/ai/flows/analyze-scene-background';
import { analyzeProductImage } from '@/ai/flows/analyze-product-image';
import { analyzeTextProfile } from '@/ai/flows/analyze-text-profile';
import { generateVideoScript } from '@/ai/flows/generate-video-script';
import { generateSeoForPlatforms } from '@/ai/flows/generate-seo-flow';
import { generateSceneAction } from '@/ai/flows/generate-scene-action';
import { generateSceneTitle } from '@/ai/flows/generate-scene-title';
import { generateSceneDialogue } from '@/ai/flows/generate-scene-dialogue';
import { generateQuickScene } from '@/ai/flows/generate-quick-scene';
import { generateVeoPrompt } from '@/ai/flows/generate-veo-prompt';
import { generateThumbnailIdeas } from '@/ai/flows/generate-thumbnail-ideas';
import { generateViralScript } from '@/ai/flows/generate-viral-script';
import { transcribeUploadedVideo } from '@/ai/flows/transcribe-uploaded-video';
import { generateScriptFromTranscription } from '@/ai/flows/generate-script-from-transcription';
import { generateParaphrasedScriptFromTranscription } from '@/ai/flows/generate-paraphrased-script-from-transcription';
import { generateLongScript } from '@/ai/flows/generate-long-script';
import { generateWebDocScript } from '@/ai/flows/generate-web-doc-script';
import { generatePromptsFromScript } from '@/ai/flows/generate-image-prompts-from-script';
import { generateSeoFromScript } from '@/ai/flows/generate-seo-from-script';
import { generateThumbnailFromScript } from '@/ai/flows/generate-thumbnail-from-script';
import { generateImageFromPrompt } from '@/ai/flows/generate-image-from-prompt';

const createEmptyInfluencer = (): Influencer => ({
  id: null,
  name: '',
  niche: '',
  personality: '',
  appearance: '',
  clothing: '',
  bio: '',
  uniqueTrait: '',
  negativePrompt: '',
  age: '',
  gender: '',
  accent: 'Standard Brazilian Portuguese',
  seed: Math.floor(Math.random() * 1000000),
  imagePreview: '',
});

const createEmptyScene = (): Scene => ({
  id: null,
  title: '',
  setting: '',
  action: '',
  dialogue: '',
  cameraAngle: 'Câmera Dinâmica (Criatividade da IA)',
  duration: '8 seg',
  videoFormat: '9:16 (Vertical)',
  productName: '',
  productBrand: '',
  productDescription: '',
  productImagePreview: '',
  productImageType: '',
  isPartnership: false,
  scenarioImagePreview: '',
  scenarioImageType: '',
  allowDigitalText: false,
  onlyPhysicalText: false,
});

export default function ScriptifyStudio() {
  // Check if API is configured from environment variable
  const [isApiConfigured, setIsApiConfigured] = useState(!!process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isQuickSceneModalOpen, setIsQuickSceneModalOpen] = useState(false);
  const [isImagePreviewModalOpen, setIsImagePreviewModalOpen] = useState(false);
  const [imagePreviewData, setImagePreviewData] = useState<{ url: string; prompt: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<ActiveView>('bento');
  const [hasPurchased] = useState(false);

  // Data states
  const [influencer, setInfluencer] = useState<Influencer>(createEmptyInfluencer);
  const [currentScene, setCurrentScene] = useState<Scene>(createEmptyScene);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [generatedSeoContent, setGeneratedSeoContent] = useState('');
  const [generatedVeoPrompt, setGeneratedVeoPrompt] = useState('');
  const [generatedQuickScene, setGeneratedQuickScene] = useState<Scene | null>(null);
  const [generatedThumbnailIdeas, setGeneratedThumbnailIdeas] = useState<ThumbnailIdeas | null>(null);
  const [generatedViralScene, setGeneratedViralScene] = useState<Scene | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [generatedUploadedVideoTranscription, setGeneratedUploadedVideoTranscription] = useState('');
  const [generatedLongScript, setGeneratedLongScript] = useState<{ scenes: LongScriptScene[], fullScriptTxt: string } | null>(null);
  const [generatedWebDocScript, setGeneratedWebDocScript] = useState<WebDocScript | null>(null);
  const [generatedWebDocSeo, setGeneratedWebDocSeo] = useState('');
  const [pastedScript, setPastedScript] = useState('');
  const [generatedScenePrompts, setGeneratedScenePrompts] = useState<ScenePrompts[] | null>(null);
  const [generatedSeoFromScript, setGeneratedSeoFromScript] = useState('');
  const [generatedThumbnailFromScript, setGeneratedThumbnailFromScript] = useState<ThumbnailIdeas | null>(null);
  const [generatedThumbnailFromWebDoc, setGeneratedThumbnailFromWebDoc] = useState<ThumbnailIdeas | null>(null);
  const [generatedSeoFromLongScript, setGeneratedSeoFromLongScript] = useState<string | null>(null);
  const [generatedThumbnailFromLongScript, setGeneratedThumbnailFromLongScript] = useState<ThumbnailIdeas | null>(null);

  // Loading states
  const [loadingStates, setLoadingStates] = useState<LoadingStates>({
    savingInfluencer: false,
    savingScene: false,
    analyzingInfluencer: false,
    analyzingScenario: false,
    analyzingProduct: false,
    generatingScript: false,
    analyzingFromText: false,
    generatingSeo: false,
    generatingAction: false,
    generatingTitle: false,
    generatingDialogue: false,
    generatingQuickScene: false,
    generatingVeoPrompt: false,
    analyzingYouTube: false,
    generatingThumbnail: false,
    generatingViralScript: false,
    transcribingUploadedVideo: false,
    generatingScriptFromTranscription: false,
    generatingParaphrasedScriptFromTranscription: false,
    generatingLongScript: false,
    generatingWebDoc: false,
    generatingWebDocSeo: false,
    generatingImagePrompts: false,
    generatingSeoFromScript: false,
    generatingThumbnailFromScript: false,
    generatingImageFromPastedScript: false,
    generatingThumbnailFromWebDoc: false,
    generatingWebDocImage: false,
    loadingSeoFromLongScript: false,
    loadingThumbnailFromLongScript: false,
  });

  const { toast } = useToast();

  // Initialize app
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if API key is configured from environment
        if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
          setIsApiConfigured(true);
        } else {
          // Check for cookie-based API key (existing functionality)
          const cookie = document.cookie.split('; ').find(row => row.startsWith('gemini_api_key='));
          if (cookie) {
            setIsApiConfigured(true);
          }
        }

        // Load data from localStorage
        const savedInfluencers = localStorage.getItem('scriptify_influencers');
        const savedScenes = localStorage.getItem('scriptify_scenes');
        
        if (savedInfluencers) {
          setInfluencers(JSON.parse(savedInfluencers));
        }
        if (savedScenes) {
          setScenes(JSON.parse(savedScenes));
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        toast({
          variant: 'destructive',
          title: 'Erro de Inicialização',
          description: 'Ocorreu um erro ao carregar os dados salvos.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [toast]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (influencers.length > 0) {
      try {
        // Create a version of influencers without imagePreview to save space
        const influencersToSave = influencers.map(({ imagePreview, ...rest }) => rest);
        localStorage.setItem('scriptify_influencers', JSON.stringify(influencersToSave));
      } catch (error) {
        console.error('Error saving influencers to localStorage:', error);
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          toast({
            variant: 'destructive',
            title: 'Erro de Armazenamento',
            description: 'Não foi possível salvar os influenciadores. O armazenamento local está cheio.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Erro ao Salvar',
            description: 'Não foi possível salvar os influenciadores.',
          });
        }
      }
    }
  }, [influencers, toast]);

  useEffect(() => {
    if (scenes.length > 0) {
      try {
        const scenesToSave = scenes.map(({ scenarioImagePreview, productImagePreview, ...rest }) => rest);
        localStorage.setItem('scriptify_scenes', JSON.stringify(scenesToSave));
      } catch (error) {
        console.error('Error saving scenes to localStorage:', error);
         if (error instanceof DOMException && error.name === 'QuotaExceededError') {
            toast({
              variant: 'destructive',
              title: 'Erro de Armazenamento',
              description: 'Não foi possível salvar as cenas. O armazenamento local está cheio.',
            });
         } else {
            toast({
              variant: 'destructive',
              title: 'Erro ao Salvar',
              description: 'Não foi possível salvar as cenas.',
            });
         }
      }
    }
  }, [scenes, toast]);

  const setLoadingState = useCallback((key: keyof LoadingStates, value: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  // API Key management
  const handleSaveApiKey = (apiKey: string) => {
    document.cookie = `gemini_api_key=${apiKey}; path=/; max-age=${60 * 60 * 24 * 30}`;
    setIsApiConfigured(true);
    setIsLoginModalOpen(false);
    toast({
      variant: 'success',
      title: 'Chave API Configurada',
      description: 'A sua chave API foi guardada com sucesso.',
    });
  };

  // AI Analysis Functions
  const analyzeAndFillFromText = async () => {
    if (!pastedText.trim()) return;
    
    setLoadingState('analyzingFromText', true);
    try {
      const result = await analyzeTextProfile({ pastedText });
      setInfluencer(prev => ({
        ...prev,
        name: result.name || prev.name,
        niche: result.niche || prev.niche,
        personality: result.personality || prev.personality,
        appearance: result.appearance || prev.appearance,
        clothing: result.clothing || prev.clothing,
        bio: result.bio || prev.bio,
        uniqueTrait: result.uniqueTrait || prev.uniqueTrait,
        negativePrompt: result.negativePrompt || prev.negativePrompt,
        age: result.age || prev.age,
        gender: result.gender || prev.gender,
        accent: result.accent || prev.accent,
      }));
      toast({ variant: 'success', title: 'Análise concluída!', description: 'Os campos foram preenchidos automaticamente.' });
    } catch (error) {
      console.error('Error analyzing text:', error);
      toast({ variant: 'destructive', title: 'Erro na análise', description: 'Não foi possível analisar o texto.' });
    } finally {
      setLoadingState('analyzingFromText', false);
    }
  };

  const analyzeInfluencerImageAndFill = async () => {
    if (!influencer.imagePreview) return;
    
    setLoadingState('analyzingInfluencer', true);
    try {
      const result = await analyzeInfluencerImage({ photoDataUri: influencer.imagePreview });
      setInfluencer(prev => ({
        ...prev,
        name: result.name || prev.name,
        niche: result.niche || prev.niche,
        personality: result.personality || prev.personality,
        appearance: result.appearance || prev.appearance,
        clothing: result.clothing || prev.clothing,
        bio: result.bio || prev.bio,
        uniqueTrait: result.uniqueTrait || prev.uniqueTrait,
        negativePrompt: result.negativePrompt || prev.negativePrompt,
        age: result.age || prev.age,
        gender: result.gender || prev.gender,
        accent: result.accent || prev.accent,
      }));
      toast({ variant: 'success', title: 'Análise concluída!', description: 'Os campos foram preenchidos com base na imagem.' });
    } catch (error) {
      console.error('Error analyzing influencer image:', error);
      toast({ variant: 'destructive', title: 'Erro na análise', description: 'Não foi possível analisar a imagem.' });
    } finally {
      setLoadingState('analyzingInfluencer', false);
    }
  };

  const analyzeScenarioImageAndFill = async () => {
    if (!currentScene.scenarioImagePreview) return;
    
    setLoadingState('analyzingScenario', true);
    try {
      const result = await analyzeSceneBackground({
        scenarioImageBase64: currentScene.scenarioImagePreview,
        scenarioImageType: currentScene.scenarioImageType,
      });
      setCurrentScene(prev => ({
        ...prev,
        setting: result.settingDescription || prev.setting,
      }));
      toast({ variant: 'success', title: 'Análise concluída!', description: 'O cenário foi preenchido com base na imagem.' });
    } catch (error) {
      console.error('Error analyzing scenario image:', error);
      toast({ variant: 'destructive', title: 'Erro na análise', description: 'Não foi possível analisar a imagem do cenário.' });
    } finally {
      setLoadingState('analyzingScenario', false);
    }
  };

  const analyzeAndDescribeProduct = async () => {
    if (!currentScene.productImagePreview) return;
    
    setLoadingState('analyzingProduct', true);
    try {
      const result = await analyzeProductImage({ productImageDataUri: currentScene.productImagePreview });
      setCurrentScene(prev => ({
        ...prev,
        productName: result.productName || prev.productName,
        productBrand: result.productBrand || prev.productBrand,
        productDescription: result.productDescription || prev.productDescription,
      }));
      toast({ variant: 'success', title: 'Análise concluída!', description: 'Os detalhes do produto foram preenchidos.' });
    } catch (error) {
      console.error('Error analyzing product image:', error);
      toast({ variant: 'destructive', title: 'Erro na análise', description: 'Não foi possível analisar a imagem do produto.' });
    } finally {
      setLoadingState('analyzingProduct', false);
    }
  };

  // Script Generation Functions
  const generateSceneContent = async (scene: Scene) => {
    if (!scene.setting || !influencer.id) return;
    
    setLoadingState('generatingScript', true);
    try {
      const result = await generateVideoScript({
        influencerName: influencer.name,
        influencerPersonality: influencer.personality,
        influencerAppearance: influencer.appearance,
        influencerNiche: influencer.niche,
        influencerSeed: influencer.seed,
        influencerAccent: influencer.accent,
        sceneTitle: scene.title,
        sceneSetting: scene.setting,
        sceneAction: scene.action,
        sceneDialogue: scene.dialogue,
        sceneCameraAngle: scene.cameraAngle,
        sceneDuration: scene.duration,
        sceneVideoFormat: scene.videoFormat,
        productName: scene.productName,
        productBrand: scene.productBrand,
        productDescription: scene.productDescription,
        isPartnership: scene.isPartnership,
        allowDigitalText: scene.allowDigitalText,
        onlyPhysicalText: scene.onlyPhysicalText,
      });
      setGeneratedContent(result);
      toast({ variant: 'success', title: 'Roteiro gerado!', description: 'O roteiro foi criado com sucesso.' });
    } catch (error) {
      console.error('Error generating script:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar o roteiro.' });
    } finally {
      setLoadingState('generatingScript', false);
    }
  };

  const generateVeoPromptHandler = async () => {
    if (!currentScene.setting || !influencer.id) return;
    
    setLoadingState('generatingVeoPrompt', true);
    try {
      const result = await generateVeoPrompt({
        influencerAppearance: influencer.appearance,
        sceneSetting: currentScene.setting,
        sceneAction: currentScene.action,
        sceneDialogue: currentScene.dialogue,
        sceneCameraAngle: currentScene.cameraAngle,
        videoFormat: currentScene.videoFormat,
      });
      setGeneratedVeoPrompt(`\`\`\`\n${result.veoPrompt}\n\`\`\``);
      toast({ variant: 'success', title: 'Prompt Veo gerado!', description: 'O prompt para Veo foi criado com sucesso.' });
    } catch (error) {
      console.error('Error generating Veo prompt:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar o prompt Veo.' });
    } finally {
      setLoadingState('generatingVeoPrompt', false);
    }
  };

  const generateDialogueSeo = async () => {
    if (!currentScene.dialogue.trim()) return;
    
    setLoadingState('generatingSeo', true);
    try {
      const result = await generateSeoForPlatforms({ dialogue: currentScene.dialogue });
      setGeneratedSeoContent(result);
      toast({ variant: 'success', title: 'SEO gerado!', description: 'O conteúdo SEO foi criado com sucesso.' });
    } catch (error) {
      console.error('Error generating SEO:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar o SEO.' });
    } finally {
      setLoadingState('generatingSeo', false);
    }
  };

  const generateSceneActionHandler = async () => {
    if (!currentScene.setting.trim()) return;
    
    setLoadingState('generatingAction', true);
    try {
      const result = await generateSceneAction({ sceneSetting: currentScene.setting });
      setCurrentScene(prev => ({ ...prev, action: result.sceneAction }));
      toast({ variant: 'success', title: 'Ação gerada!', description: 'A ação da cena foi criada com sucesso.' });
    } catch (error) {
      console.error('Error generating scene action:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar a ação.' });
    } finally {
      setLoadingState('generatingAction', false);
    }
  };

  const generateSceneTitleHandler = async () => {
    if (!currentScene.setting.trim() || !currentScene.action.trim()) return;
    
    setLoadingState('generatingTitle', true);
    try {
      const result = await generateSceneTitle({
        sceneSetting: currentScene.setting,
        sceneAction: currentScene.action,
      });
      setCurrentScene(prev => ({ ...prev, title: result.sceneTitle }));
      toast({ variant: 'success', title: 'Título gerado!', description: 'O título da cena foi criado com sucesso.' });
    } catch (error) {
      console.error('Error generating scene title:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar o título.' });
    } finally {
      setLoadingState('generatingTitle', false);
    }
  };

  const generateSceneDialogueHandler = async () => {
    if (!currentScene.setting.trim() || !currentScene.action.trim()) return;
    
    setLoadingState('generatingDialogue', true);
    try {
      const result = await generateSceneDialogue({
        influencerPersonality: influencer.personality,
        influencerAccent: influencer.accent,
        sceneSetting: currentScene.setting,
        sceneAction: currentScene.action,
        sceneDuration: currentScene.duration,
      });
      setCurrentScene(prev => ({ ...prev, dialogue: result.dialogue }));
      toast({ variant: 'success', title: 'Diálogo gerado!', description: 'O diálogo da cena foi criado com sucesso.' });
    } catch (error) {
      console.error('Error generating scene dialogue:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar o diálogo.' });
    } finally {
      setLoadingState('generatingDialogue', false);
    }
  };

  // Data Management Functions
  const saveOrUpdateInfluencer = () => {
    setLoadingState('savingInfluencer', true);
    try {
      const influencerToSave = {
        ...influencer,
        id: influencer.id || nanoid(),
        created_at: influencer.created_at || new Date().toISOString(),
      };

      setInfluencers(prev => {
        const existingIndex = prev.findIndex(inf => inf.id === influencerToSave.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = influencerToSave;
          return updated;
        }
        return [...prev, influencerToSave];
      });

      setInfluencer(influencerToSave);
      toast({ variant: 'success', title: 'Influenciador guardado!', description: 'O influenciador foi adicionado à galeria.' });
    } catch (error) {
      console.error('Error saving influencer:', error);
      toast({ variant: 'destructive', title: 'Erro ao guardar', description: 'Não foi possível guardar o influenciador.' });
    } finally {
      setLoadingState('savingInfluencer', false);
    }
  };

  const handleAddUpdateScene = () => {
    setLoadingState('savingScene', true);
    try {
      const sceneToSave = {
        ...currentScene,
        id: currentScene.id || nanoid(),
        created_at: currentScene.created_at || new Date().toISOString(),
      };

      setScenes(prev => {
        const existingIndex = prev.findIndex(sc => sc.id === sceneToSave.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = sceneToSave;
          return updated;
        }
        return [...prev, sceneToSave];
      });

      setCurrentScene(sceneToSave);
      toast({ variant: 'success', title: 'Cena guardada!', description: 'A cena foi adicionada à galeria.' });
    } catch (error) {
      console.error('Error saving scene:', error);
      toast({ variant: 'destructive', title: 'Erro ao guardar', description: 'Não foi possível guardar a cena.' });
    } finally {
      setLoadingState('savingScene', false);
    }
  };

  // Image Upload Handler
  const handleImageUploadHandler = (e: React.ChangeEvent<HTMLInputElement>, type: 'influencer' | 'scenario' | 'product') => {
    handleImageUpload(e, ({ preview, base64, file }) => {
      if (type === 'influencer') {
        setInfluencer(prev => ({ ...prev, imagePreview: preview }));
      } else if (type === 'scenario') {
        setCurrentScene(prev => ({
          ...prev,
          scenarioImagePreview: preview,
          scenarioImageType: file.type,
        }));
      } else if (type === 'product') {
        setCurrentScene(prev => ({
          ...prev,
          productImagePreview: preview,
          productImageType: file.type,
        }));
      }
    });
  };

  // Quick Scene Generation
  const generateQuickSceneHandler = async (jokeTheme: string, scenarioSuggestion?: string, imageReferenceDataUri?: string) => {
    if (!influencer.id) return;
    
    setLoadingState('generatingQuickScene', true);
    try {
      const result = await generateQuickScene({
        influencerPersonality: influencer.personality,
        influencerNiche: influencer.niche,
        influencerAppearance: influencer.appearance,
        negativePrompt: influencer.negativePrompt,
        jokeTheme,
        scenarioSuggestion,
        imageReferenceDataUri,
      });
      
      const newScene: Scene = {
        ...createEmptyScene(),
        title: result.title,
        setting: result.setting,
        action: result.action,
        dialogue: result.dialogue,
        markdownScript: result.markdownScript,
      };
      
      setGeneratedQuickScene(newScene);
      toast({ variant: 'success', title: 'Cena rápida gerada!', description: 'A cena cômica foi criada com sucesso.' });
    } catch (error) {
      console.error('Error generating quick scene:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar a cena rápida.' });
    } finally {
      setLoadingState('generatingQuickScene', false);
    }
  };

  const saveQuickSceneHandler = async () => {
    if (!generatedQuickScene) return;
    
    const sceneToSave = {
      ...generatedQuickScene,
      id: nanoid(),
      created_at: new Date().toISOString(),
    };

    setScenes(prev => [...prev, sceneToSave]);
    setCurrentScene(sceneToSave);
    setGeneratedQuickScene(null);
    setIsQuickSceneModalOpen(false);
    setActiveView('creator');
    toast({ variant: 'success', title: 'Cena carregada!', description: 'A cena foi guardada e carregada no criador.' });
  };

  // Thumbnail Generation
  const generateThumbnailHandler = async (mainImageDataUri: string, backgroundImageDataUri: string | undefined, videoTheme: string, thumbnailStyle: ThumbnailStyle) => {
    setLoadingState('generatingThumbnail', true);
    try {
      const result = await generateThumbnailIdeas({
        mainImageDataUri,
        backgroundImageDataUri,
        videoTheme,
        thumbnailStyle,
      });
      setGeneratedThumbnailIdeas(result);
      toast({ variant: 'success', title: 'Thumbnail gerada!', description: 'As ideias de thumbnail foram criadas com sucesso.' });
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar a thumbnail.' });
    } finally {
      setLoadingState('generatingThumbnail', false);
    }
  };

  // Viral Script Generation
  const generateViralScriptHandler = async (videoTitle: string, imageDataUri: string | null, duration: string, videoType: 'shorts' | 'watch', cta: string | undefined) => {
    setLoadingState('generatingViralScript', true);
    try {
      const result = await generateViralScript({
        videoTitle,
        imageDataUri,
        duration,
        videoType,
        cta,
      });
      
      const newScene: Scene = {
        ...createEmptyScene(),
        title: result.title,
        setting: result.setting,
        action: result.action,
        dialogue: result.dialogue,
        markdownScript: result.markdownScript,
        duration,
      };
      
      setGeneratedViralScene(newScene);
      toast({ variant: 'success', title: 'Roteiro viral gerado!', description: 'O roteiro foi criado com sucesso.' });
    } catch (error) {
      console.error('Error generating viral script:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar o roteiro viral.' });
    } finally {
      setLoadingState('generatingViralScript', false);
    }
  };

  // Video Transcription
  const transcribeUploadedVideoHandler = async (videoDataUri: string) => {
    setLoadingState('transcribingUploadedVideo', true);
    try {
      const result = await transcribeUploadedVideo({ videoDataUri });
      setGeneratedUploadedVideoTranscription(result.transcription);
      toast({ variant: 'success', title: 'Transcrição concluída!', description: 'O vídeo foi transcrito com sucesso.' });
    } catch (error) {
      console.error('Error transcribing uploaded video:', error);
      toast({ variant: 'destructive', title: 'Erro na transcrição', description: 'Não foi possível transcrever o vídeo.' });
    } finally {
      setLoadingState('transcribingUploadedVideo', false);
    }
  };

  const generateScriptFromTranscriptionHandler = async (imageDataUri?: string) => {
    if (!generatedUploadedVideoTranscription) return;
    
    setLoadingState('generatingScriptFromTranscription', true);
    try {
      const result = await generateScriptFromTranscription({
        transcription: generatedUploadedVideoTranscription,
        imageDataUri,
      });
      
      const newScene: Scene = {
        ...createEmptyScene(),
        title: result.title,
        setting: result.setting,
        action: result.action,
        dialogue: result.dialogue,
        markdownScript: result.markdownScript,
      };
      
      setGeneratedViralScene(newScene);
      toast({ variant: 'success', title: 'Roteiro gerado!', description: 'O roteiro foi criado a partir da transcrição.' });
    } catch (error) {
      console.error('Error generating script from transcription:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar o roteiro.' });
    } finally {
      setLoadingState('generatingScriptFromTranscription', false);
    }
  };

  const generateParaphrasedScriptFromTranscriptionHandler = async (imageDataUri?: string) => {
    if (!generatedUploadedVideoTranscription) return;
    
    setLoadingState('generatingParaphrasedScriptFromTranscription', true);
    try {
      const result = await generateParaphrasedScriptFromTranscription({
        transcription: generatedUploadedVideoTranscription,
        imageDataUri,
      });
      
      const newScene: Scene = {
        ...createEmptyScene(),
        title: result.title,
        setting: result.setting,
        action: result.action,
        dialogue: result.dialogue,
        markdownScript: result.markdownScript,
      };
      
      setGeneratedViralScene(newScene);
      toast({ variant: 'success', title: 'Roteiro reescrito!', description: 'O roteiro foi reescrito com outras palavras.' });
    } catch (error) {
      console.error('Error generating paraphrased script:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível reescrever o roteiro.' });
    } finally {
      setLoadingState('generatingParaphrasedScriptFromTranscription', false);
    }
  };

  // Long Script Generation
  const generateLongScriptHandler = async (videoTheme: string, duration: string, cameraAngle: string, influencerId?: string, sceneId?: string) => {
    setLoadingState('generatingLongScript', true);
    try {
      const selectedInfluencer = influencerId && influencerId !== 'none' ? influencers.find(inf => inf.id === influencerId) : undefined;
      const selectedScene = sceneId && sceneId !== 'none' ? scenes.find(sc => sc.id === sceneId) : undefined;

      const result = await generateLongScript({
        videoTheme,
        duration,
        influencerAppearance: selectedInfluencer?.appearance,
        influencerAccent: selectedInfluencer?.accent,
        influencerPersonality: selectedInfluencer?.personality,
        influencerUniqueTrait: selectedInfluencer?.uniqueTrait,
        influencerNegativePrompt: selectedInfluencer?.negativePrompt,
        sceneSetting: selectedScene?.setting,
        sceneCameraAngle: cameraAngle,
      });
      
      setGeneratedLongScript(result);
      toast({ variant: 'success', title: 'Roteiro longo gerado!', description: 'O roteiro foi criado com sucesso.' });
    } catch (error) {
      console.error('Error generating long script:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar o roteiro longo.' });
    } finally {
      setLoadingState('generatingLongScript', false);
    }
  };

  // Web Doc Generation
  const generateWebDocScriptHandler = async (theme: string, duration: string, topics?: string) => {
    setLoadingState('generatingWebDoc', true);
    try {
      const result = await generateWebDocScript({ theme, duration, topics });
      setGeneratedWebDocScript(result);
      toast({ variant: 'success', title: 'Roteiro de Web Doc gerado!', description: 'O roteiro foi criado com sucesso.' });
    } catch (error) {
      console.error('Error generating web doc script:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar o roteiro de web doc.' });
    } finally {
      setLoadingState('generatingWebDoc', false);
    }
  };

  const generateWebDocSeoHandler = async () => {
    if (!generatedWebDocScript) return;
    
    setLoadingState('generatingWebDocSeo', true);
    try {
      const fullScript = generatedWebDocScript.scenes.map(scene => scene.sceneScript).join('\n\n');
      const result = await generateSeoFromScript({ scriptText: fullScript });
      setGeneratedWebDocSeo(result);
      toast({ variant: 'success', title: 'SEO gerado!', description: 'O SEO foi criado para o web doc.' });
    } catch (error) {
      console.error('Error generating web doc SEO:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar o SEO.' });
    } finally {
      setLoadingState('generatingWebDocSeo', false);
    }
  };

  const exportWebDocScriptHandler = () => {
    if (!generatedWebDocScript) return;
    
    let content = `# ${generatedWebDocScript.title}\n\n`;
    generatedWebDocScript.scenes.forEach((scene, index) => {
      content += `## Cena ${scene.sceneNumber}\n\n`;
      content += `**Roteiro:** ${scene.sceneScript}\n\n`;
      content += `**Prompt de Imagem:** ${scene.imagePrompt}\n\n`;
      content += `**Prompt de Vídeo:** ${scene.videoPrompt}\n\n`;
      if (index < generatedWebDocScript.scenes.length - 1) content += '---\n\n';
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'web_doc_roteiro.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ variant: 'success', title: 'Web Doc exportado como TXT!' });
  };

  // Script Analysis Functions
  const handleExportPrompts = () => {
    if (!generatedScenePrompts) return;
    
    let content = '# Prompts de Imagem e Vídeo por Cena\n\n';
    generatedScenePrompts.forEach((prompt, index) => {
      content += `## Cena ${prompt.sceneNumber}\n\n`;
      content += `**Prompt de Imagem (EN):** ${prompt.imagePrompt}\n\n`;
      content += `**Prompt de Vídeo (EN):** ${prompt.videoPrompt}\n\n`;
      if (index < generatedScenePrompts.length - 1) content += '---\n\n';
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prompts_cenas.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ variant: 'success', title: 'Prompts exportados como TXT!' });
  };

  const generatePromptsFromScriptHandler = async () => {
    if (!pastedScript.trim()) return;
    
    setLoadingState('generatingImagePrompts', true);
    try {
      const result = await generatePromptsFromScript({ scriptText: pastedScript });
      setGeneratedScenePrompts(result.prompts);
      toast({ variant: 'success', title: 'Prompts gerados!', description: 'Os prompts de imagem e vídeo foram criados.' });
    } catch (error) {
      console.error('Error generating prompts from script:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar os prompts.' });
    } finally {
      setLoadingState('generatingImagePrompts', false);
    }
  };

  const generateSeoFromScriptHandler = async () => {
    if (!pastedScript.trim()) return;
    
    setLoadingState('generatingSeoFromScript', true);
    try {
      const result = await generateSeoFromScript({ scriptText: pastedScript });
      setGeneratedSeoFromScript(result);
      toast({ variant: 'success', title: 'SEO gerado!', description: 'O SEO foi criado a partir do roteiro.' });
    } catch (error) {
      console.error('Error generating SEO from script:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar o SEO.' });
    } finally {
      setLoadingState('generatingSeoFromScript', false);
    }
  };

  const generateThumbnailFromScriptHandler = async () => {
    if (!pastedScript.trim()) return;
    
    setLoadingState('generatingThumbnailFromScript', true);
    try {
      const result = await generateThumbnailFromScript({ scriptText: pastedScript });
      setGeneratedThumbnailFromScript(result);
      toast({ variant: 'success', title: 'Thumbnail gerada!', description: 'A thumbnail foi criada a partir do roteiro.' });
    } catch (error) {
      console.error('Error generating thumbnail from script:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar a thumbnail.' });
    } finally {
      setLoadingState('generatingThumbnailFromScript', false);
    }
  };

  const generateThumbnailFromWebDocHandler = async () => {
    if (!generatedWebDocScript) return;
    
    setLoadingState('generatingThumbnailFromWebDoc', true);
    try {
      const fullScript = generatedWebDocScript.scenes.map(scene => scene.sceneScript).join('\n\n');
      const result = await generateThumbnailFromScript({ scriptText: fullScript });
      setGeneratedThumbnailFromWebDoc(result);
      toast({ variant: 'success', title: 'Thumbnail gerada!', description: 'A thumbnail foi criada para o web doc.' });
    } catch (error) {
      console.error('Error generating thumbnail from web doc:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar a thumbnail.' });
    } finally {
      setLoadingState('generatingThumbnailFromWebDoc', false);
    }
  };

  const generateImageForWebDocHandler = async (prompt: string) => {
    setLoadingState('generatingWebDocImage', true);
    try {
      const result = await generateImageFromPrompt({ prompt });
      setImagePreviewData({ url: result.imageDataUri, prompt });
      setIsImagePreviewModalOpen(true);
      toast({ variant: 'success', title: 'Imagem gerada!', description: 'A imagem foi criada a partir do prompt.' });
    } catch (error) {
      console.error('Error generating image for web doc:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar a imagem.' });
    } finally {
      setLoadingState('generatingWebDocImage', false);
    }
  };

  const generateImageFromPastedScriptHandler = async (prompt: string) => {
    setLoadingState('generatingImageFromPastedScript', true);
    try {
      const result = await generateImageFromPrompt({ prompt });
      setImagePreviewData({ url: result.imageDataUri, prompt });
      setIsImagePreviewModalOpen(true);
      toast({ variant: 'success', title: 'Imagem gerada!', description: 'A imagem foi criada a partir do prompt.' });
    } catch (error) {
      console.error('Error generating image from pasted script:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar a imagem.' });
    } finally {
      setLoadingState('generatingImageFromPastedScript', false);
    }
  };

  const generateSeoFromLongScriptHandler = async () => {
    if (!generatedLongScript) return;
    
    setLoadingState('loadingSeoFromLongScript', true);
    try {
      const result = await generateSeoFromScript({ scriptText: generatedLongScript.fullScriptTxt });
      setGeneratedSeoFromLongScript(result);
      toast({ variant: 'success', title: 'SEO gerado!', description: 'O SEO foi criado a partir do roteiro longo.' });
    } catch (error) {
      console.error('Error generating SEO from long script:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar o SEO.' });
    } finally {
      setLoadingState('loadingSeoFromLongScript', false);
    }
  };

  const generateThumbnailFromLongScriptHandler = async () => {
    if (!generatedLongScript) return;
    
    setLoadingState('loadingThumbnailFromLongScript', true);
    try {
      const result = await generateThumbnailFromScript({ scriptText: generatedLongScript.fullScriptTxt });
      setGeneratedThumbnailFromLongScript(result);
      toast({ variant: 'success', title: 'Thumbnail gerada!', description: 'A thumbnail foi criada a partir do roteiro longo.' });
    } catch (error) {
      console.error('Error generating thumbnail from long script:', error);
      toast({ variant: 'destructive', title: 'Erro na geração', description: 'Não foi possível gerar a thumbnail.' });
    } finally {
      setLoadingState('loadingThumbnailFromLongScript', false);
    }
  };

  // Gallery Management Functions
  const loadInfluencer = (id: string) => {
    const influencerToLoad = influencers.find(inf => inf.id === id);
    if (influencerToLoad) {
      setInfluencer(influencerToLoad);
      setActiveView('creator');
      toast({ variant: 'success', title: 'Influenciador carregado!', description: `${influencerToLoad.name} foi carregado no editor.` });
    }
  };

  const loadScene = (id: string) => {
    const sceneToLoad = scenes.find(sc => sc.id === id);
    if (sceneToLoad) {
      setCurrentScene(sceneToLoad);
      setActiveView('creator');
      toast({ variant: 'success', title: 'Cena carregada!', description: 'A cena foi carregada no editor.' });
    }
  };

  const deleteInfluencer = (id: string) => {
    setInfluencers(prev => prev.filter(inf => inf.id !== id));
    toast({ variant: 'success', title: 'Influenciador removido!', description: 'O influenciador foi removido da galeria.' });
  };

  const deleteScene = (id: string) => {
    setScenes(prev => prev.filter(sc => sc.id !== id));
    toast({ variant: 'success', title: 'Cena removida!', description: 'A cena foi removida da galeria.' });
  };

  const openQuickSceneModal = (influencerId: string) => {
    const influencerToUse = influencers.find(inf => inf.id === influencerId);
    if (influencerToUse) {
      setInfluencer(influencerToUse);
      setIsQuickSceneModalOpen(true);
    }
  };

  const loadSceneToCreator = (scene: Scene) => {
    setCurrentScene(scene);
    setActiveView('creator');
    toast({ variant: 'success', title: 'Cena carregada!', description: 'A cena foi carregada no criador.' });
  };

  const clearTranscription = () => {
    setGeneratedUploadedVideoTranscription('');
    setGeneratedViralScene(null);
  };

  // Reset Functions
  const resetInfluencer = () => {
    setInfluencer(createEmptyInfluencer());
    setPastedText('');
    setGeneratedContent('');
    setGeneratedSeoContent('');
    setGeneratedVeoPrompt('');
  };

  const resetScene = () => {
    setCurrentScene(createEmptyScene());
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <AppHeader 
        isApiConfigured={isApiConfigured} 
        onOpenLoginModal={() => setIsLoginModalOpen(true)} 
      />
      
      {activeView !== 'bento' && (
        <div className="mb-6">
          <Button variant="outline" onClick={() => setActiveView('bento')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar para o Início
          </Button>
        </div>
      )}

      <PromoBanner hasPurchased={hasPurchased} />

      {activeView === 'bento' && (
        <BentoGrid setView={setActiveView} />
      )}

      {activeView === 'creator' && (
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
            handleImageUpload: handleImageUploadHandler,
            resetInfluencer,
            resetScene,
          }}
        />
      )}

      {activeView === 'influencerGallery' && (
        <InfluencerGalleryView
          influencers={influencers}
          onLoad={loadInfluencer}
          onDelete={deleteInfluencer}
          onAddNew={() => {
            resetInfluencer();
            setActiveView('creator');
          }}
          onQuickScene={openQuickSceneModal}
        />
      )}

      {activeView === 'sceneGallery' && (
        <SceneGalleryView
          scenes={scenes}
          onLoad={loadScene}
          onDelete={deleteScene}
          onAddNew={() => {
            resetScene();
            setActiveView('creator');
          }}
        />
      )}

      {activeView === 'viralTools' && (
        <ViralToolsView
          isApiConfigured={isApiConfigured}
          onGenerateViralScript={generateViralScriptHandler}
          loadingViralScript={loadingStates.generatingViralScript}
          generatedViralScene={generatedViralScene}
          onLoadToCreator={loadSceneToCreator}
        />
      )}

      {activeView === 'advancedTools' && (
        <AdvancedToolsView
          isApiConfigured={isApiConfigured}
          influencers={influencers}
          scenes={scenes}
          onGenerateLongScript={generateLongScriptHandler}
          loadingLongScript={loadingStates.generatingLongScript}
          generatedLongScript={generatedLongScript}
          onGenerateWebDocScript={generateWebDocScriptHandler}
          loadingWebDoc={loadingStates.generatingWebDoc}
          generatedWebDocScript={generatedWebDocScript}
          onExportWebDocScript={exportWebDocScriptHandler}
          onGenerateWebDocSeo={generateWebDocSeoHandler}
          loadingWebDocSeo={loadingStates.generatingWebDocSeo}
          generatedWebDocSeo={generatedWebDocSeo}
          pastedScript={pastedScript}
          setPastedText={setPastedScript}
          onGeneratePromptsFromScript={generatePromptsFromScriptHandler}
          loadingImagePrompts={loadingStates.generatingImagePrompts}
          generatedScenePrompts={generatedScenePrompts}
          onGenerateSeoFromScript={generateSeoFromScriptHandler}
          loadingSeoFromScript={loadingStates.generatingSeoFromScript}
          generatedSeoFromScript={generatedSeoFromScript}
          onGenerateThumbnailFromScript={generateThumbnailFromScriptHandler}
          loadingThumbnailFromScript={loadingStates.generatingThumbnailFromScript}
          generatedThumbnailFromScript={generatedThumbnailFromScript}
          onExportPrompts={handleExportPrompts}
          onGenerateThumbnailFromWebDoc={generateThumbnailFromWebDocHandler}
          loadingThumbnailFromWebDoc={loadingStates.generatingThumbnailFromWebDoc}
          generatedThumbnailFromWebDoc={generatedThumbnailFromWebDoc}
          onGenerateImageForWebDoc={generateImageForWebDocHandler}
          loadingWebDocImage={loadingStates.generatingWebDocImage}
          onGenerateImageFromPastedScript={generateImageFromPastedScriptHandler}
          loadingImageFromPastedScript={loadingStates.generatingImageFromPastedScript}
          onGenerateSeoFromLongScript={generateSeoFromLongScriptHandler}
          loadingSeoFromLongScript={loadingStates.loadingSeoFromLongScript}
          generatedSeoFromLongScript={generatedSeoFromLongScript}
          onGenerateThumbnailFromLongScript={generateThumbnailFromLongScriptHandler}
          loadingThumbnailFromLongScript={loadingStates.loadingThumbnailFromLongScript}
          generatedThumbnailFromLongScript={generatedThumbnailFromLongScript}
        />
      )}

      {activeView === 'thumbnailGenerator' && (
        <ThumbnailGeneratorView
          onGenerateThumbnail={generateThumbnailHandler}
          generatedThumbnailIdeas={generatedThumbnailIdeas}
          loadingThumbnail={loadingStates.generatingThumbnail}
          isApiConfigured={isApiConfigured}
        />
      )}

      {activeView === 'transcribeVideo' && (
        <TranscribeVideoView
          isApiConfigured={isApiConfigured}
          youtubeUrl={youtubeUrl}
          setYoutubeUrl={setYoutubeUrl}
          loadingYouTube={loadingStates.analyzingYouTube}
          onTranscribeUploadedVideo={transcribeUploadedVideoHandler}
          loadingUploadedVideoTranscription={loadingStates.transcribingUploadedVideo}
          generatedUploadedVideoTranscription={generatedUploadedVideoTranscription}
          onGenerateScriptFromTranscription={generateScriptFromTranscriptionHandler}
          loadingScriptFromTranscription={loadingStates.generatingScriptFromTranscription}
          onGenerateParaphrasedScriptFromTranscription={generateParaphrasedScriptFromTranscriptionHandler}
          loadingParaphrasedScript={loadingStates.generatingParaphrasedScriptFromTranscription}
          onClearTranscription={clearTranscription}
          generatedViralScene={generatedViralScene}
          onLoadToCreator={loadSceneToCreator}
        />
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSave={handleSaveApiKey}
      />

      <QuickSceneModal
        isOpen={isQuickSceneModalOpen}
        onClose={() => setIsQuickSceneModalOpen(false)}
        influencer={influencer}
        onGenerate={generateQuickSceneHandler}
        onSave={saveQuickSceneHandler}
        generatedScene={generatedQuickScene}
        loading={loadingStates.generatingQuickScene}
        isApiConfigured={isApiConfigured}
      />

      <ImagePreviewModal
        isOpen={isImagePreviewModalOpen}
        onClose={() => setIsImagePreviewModalOpen(false)}
        imageDataUri={imagePreviewData?.url || null}
        loading={loadingStates.generatingWebDocImage || loadingStates.generatingImageFromPastedScript}
        prompt={imagePreviewData?.prompt || ''}
      />
    </>
  );
}

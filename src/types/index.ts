









export interface Influencer {
    id: string | null;
    name: string;
    niche: string;
    personality: string;
    appearance: string;
    clothing: string;
    bio: string;
    uniqueTrait: string;
    negativePrompt: string;
    age: string;
    gender: string;
    accent: string;
    seed: number;
    imagePreview?: string;
    created_at?: string;
}

export interface Scene {
    id: string | null;
    title: string;
    setting: string;
    action: string;
    dialogue: string;
    cameraAngle: string;
    duration: string;
    videoFormat: string;
    productName: string;
    productBrand: string;
    productDescription: string;
    productImagePreview: string;
    productImageType: string;
    isPartnership: boolean;
    scenarioImagePreview: string;
    scenarioImageType: string;
    allowDigitalText: boolean;
    onlyPhysicalText: boolean;
    markdownScript?: string;
    created_at?: string;
}

export interface ThumbnailIdeas {
    title: string;
    overlayText: string;
    styleDescription: string;
    emoji: string;
    generatedImage1DataUri: string;
    generatedImage2DataUri: string;
}

export type ActiveView = 'bento' | 'creator' | 'influencerGallery' | 'sceneGallery' | 'viralTools' | 'advancedTools' | 'thumbnailGenerator' | 'transcribeVideo';

export type LoadingStates = {
    savingInfluencer: boolean;
    savingScene: boolean;
    analyzingInfluencer: boolean;
    analyzingScenario: boolean;
    analyzingProduct: boolean;
    generatingScript: boolean;
    analyzingFromText: boolean;
    generatingSeo: boolean;
    generatingAction: boolean;
    generatingTitle: boolean;
    generatingDialogue: boolean;
    generatingQuickScene: boolean;
    generatingVeoPrompt: boolean;
    analyzingYouTube: boolean;
    generatingThumbnail: boolean;
    generatingViralScript: boolean;
    transcribingUploadedVideo: boolean;
    generatingScriptFromTranscription: boolean;
    generatingParaphrasedScriptFromTranscription: boolean;
    generatingLongScript: boolean;
    generatingWebDoc: boolean;
    generatingWebDocSeo: boolean;
    generatingImagePrompts: boolean;
    generatingSeoFromScript: boolean;
    generatingThumbnailFromScript: boolean;
    generatingImageFromPastedScript: boolean;
};

export type ThumbnailStyle =
    | 'default'
    | 'shocked-expression'
    | 'half-human-half-ai'
    | 'three-emotions'
    | 'floating-character'
    | 'dramatic-close-up'
    | 'mysterious-object'
    | 'versus-screen'
    | 'mr-beast'
    | 'detective-noir'
    | 'hacker-style'
    | 'extreme-zoom'
    | 'clickbait'
    | 'before-after'
    | 'action-freeze-frame'
    | 'cyberpunk'
    | 'silhouette'
    | 'censored-text'
    | 'explosion-background'
    | 'elemental-face'
    | 'poster';

export interface LongScriptScene {
    title: string;
    content: string;
}

export interface WebDocScene {
  sceneNumber: number;
  sceneScript: string;
  imagePrompt: string;
  videoPrompt: string;
}

export interface WebDocScript {
  title: string;
  scenes: WebDocScene[];
}

export interface ScenePrompts {
  sceneNumber: number;
  imagePrompt: string;
  videoPrompt: string;
}

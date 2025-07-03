export interface Influencer {
    id: string | null;
    name: string;
    niche: string;
    personality: string;
    appearance: string;
    bio: string;
    uniqueTrait: string;
    negativePrompt: string;
    age: string;
    gender: string;
    accent: string;
    seed: number;
    imagePreview?: string;
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
}

export type ActiveView = 'creator' | 'influencerGallery' | 'sceneGallery';
export type ApiKeyStatus = 'idle' | 'valid' | 'invalid' | 'testing';

export type LoadingStates = {
    savingInfluencer: boolean;
    savingScene: boolean;
    analyzingInfluencer: boolean;
    analyzingScenario: boolean;
    analyzingProduct: boolean;
    generatingScript: boolean;
    analyzingFromText: boolean;
    testingApi: boolean;
    generatingSeo: boolean;
    generatingAction: boolean;
    generatingTitle: boolean;
    generatingDialogue: boolean;
    generatingQuickScene: boolean;
    generatingVeoPrompt: boolean;
};

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

// Separate type for what is stored in Firestore
export type InfluencerDocument = Omit<Influencer, 'id'>;
export type SceneDocument = Omit<Scene, 'id'>;


export type ActiveView = 'creator' | 'influencerGallery' | 'sceneGallery';

export type LoadingStates = {
    savingInfluencer: boolean;
    savingScene: boolean;
    analyzingInfluencer: boolean;
    analyzingScenario: boolean;
    analyzingProduct: boolean;
    generatingScript: boolean;
    analyzingFromText: boolean;
    testingApi: boolean;
};

'use client';
import type { Influencer, Scene, LoadingStates } from '@/types';
import InfluencerEditor from './creator/influencer-editor';
import SceneEditor from './creator/scene-editor';
import ScriptGenerator from './creator/script-generator';

interface CreatorViewProps {
  influencer: Influencer;
  setInfluencer: (influencer: Influencer) => void;
  currentScene: Scene;
  setCurrentScene: (scene: Scene) => void;
  pastedText: string;
  setPastedText: (text: string) => void;
  outputFormat: string;
  setOutputFormat: (format: string) => void;
  generatedContent: string;
  setGeneratedContent: (content: string) => void;
  loadingStates: LoadingStates;
  isLoggedIn: boolean;
  handlers: {
    analyzeAndFillFromText: () => Promise<void>;
    analyzeInfluencerImageAndFill: () => Promise<void>;
    analyzeScenarioImageAndFill: () => Promise<void>;
    analyzeAndDescribeProduct: () => Promise<void>;
    generateSceneContent: (scene: Scene) => Promise<void>;
    saveOrUpdateInfluencer: () => void;
    handleAddUpdateScene: () => void;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>, type: 'influencer' | 'scenario' | 'product') => void;
    resetInfluencer: () => void;
    resetScene: () => void;
  };
}

export default function CreatorView({
  influencer,
  setInfluencer,
  currentScene,
  setCurrentScene,
  pastedText,
  setPastedText,
  outputFormat,
  setOutputFormat,
  generatedContent,
  setGeneratedContent,
  loadingStates,
  isLoggedIn,
  handlers,
}: CreatorViewProps) {
  return (
    <div className="space-y-8">
      <InfluencerEditor
        influencer={influencer}
        setInfluencer={setInfluencer}
        pastedText={pastedText}
        setPastedText={setPastedText}
        imagePreview={influencer.imagePreview || ''}
        loadingStates={loadingStates}
        isLoggedIn={isLoggedIn}
        handlers={{
          analyzeAndFillFromText: handlers.analyzeAndFillFromText,
          analyzeInfluencerImageAndFill: handlers.analyzeInfluencerImageAndFill,
          handleImageUpload: handlers.handleImageUpload,
          saveOrUpdateInfluencer: handlers.saveOrUpdateInfluencer,
          resetInfluencer: handlers.resetInfluencer,
        }}
      />

      <SceneEditor
        currentScene={currentScene}
        setCurrentScene={setCurrentScene}
        loadingStates={loadingStates}
        isLoggedIn={isLoggedIn}
        handlers={{
          analyzeScenarioImageAndFill: handlers.analyzeScenarioImageAndFill,
          analyzeAndDescribeProduct: handlers.analyzeAndDescribeProduct,
          handleAddUpdateScene: handlers.handleAddUpdateScene,
          handleImageUpload: handlers.handleImageUpload,
          resetScene: handlers.resetScene,
        }}
      />
      
      <ScriptGenerator
        outputFormat={outputFormat}
        setOutputFormat={setOutputFormat}
        generatedContent={generatedContent}
        setGeneratedContent={setGeneratedContent}
        loading={loadingStates.generatingScript}
        isLoggedIn={isLoggedIn}
        onGenerate={() => handlers.generateSceneContent(currentScene)}
        isGenerationDisabled={!currentScene.setting || !influencer.id}
        influencerId={influencer.id}
        sceneSetting={currentScene.setting}
      />
    </div>
  );
}

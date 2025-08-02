
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating video scripts based on influencer traits and scene properties.
 *
 * It exports:
 * - `generateVideoScript` - An async function that takes `VideoScriptInput` and returns a `VideoScriptOutput`.
 * - `VideoScriptInput` - The input type for the `generateVideoScript` function.
 * - `VideoScriptOutput` - The output type for the `generateVideoScript` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VideoScriptInputSchema = z.object({
  influencerName: z.string().describe('The name of the influencer.'),
  influencerPersonality: z.string().describe('The personality traits of the influencer.'),
  influencerAppearance: z.string().describe('A detailed description of the influencer appearance.'),
  influencerNiche: z.string().describe('The content niche of the influencer.'),
  influencerSeed: z.number().describe('The generation seed for the influencer.'),
  influencerAccent: z.string().describe('The accent of the influencer in Portuguese.'),
  sceneTitle: z.string().describe('The title of the video scene.'),
  sceneSetting: z.string().describe('A detailed description of the scene setting.'),
  sceneAction: z.string().describe('The main action occurring in the scene.'),
  sceneDialogue: z.string().optional().describe('Optional dialogue for the scene.'),
  sceneCameraAngle: z.string().describe('The camera angle for the scene.'),
  sceneDuration: z.string().describe('The duration of the scene.'),
  sceneVideoFormat: z.string().describe('The video format (e.g., 9:16).'),
  productName: z.string().optional().describe('The name of the product being featured (if any).'),
  productBrand: z.string().optional().describe('The brand of the product being featured (if any).'),
  productDescription: z.string().optional().describe('Detailed description of the product.'),
  isPartnership: z.boolean().optional().describe('Whether the video is a partnership/sponsored.'),
  allowDigitalText: z.boolean().optional().describe('Whether digital text overlays are allowed in the scene.'),
  onlyPhysicalText: z.boolean().optional().describe('Whether only physical text (e.g., on signs) is allowed.'),
});
export type VideoScriptInput = z.infer<typeof VideoScriptInputSchema>;

// New schema for the AI's structured output
const SecondBySecondSceneSchema = z.object({
    visualDescription: z.string().describe("A detailed visual description for this second. This field MUST be in ENGLISH. Describe camera work, character actions, and expressions, adhering to the provided camera angle and character appearance."),
    audioDialogue: z.string().describe("The dialogue for this second. This field MUST be in BRAZILIAN PORTUGUESE. It must include English emotional cues in parentheses (e.g., (Calmly, with conviction))."),
    sfx: z.string().describe("Appropriate sound effects or ambient sounds for this second. This field MUST be in ENGLISH.")
});
export type SecondBySecondScene = z.infer<typeof SecondBySecondSceneSchema>;

const ScriptGenerationOutputSchema = z.object({
    scenes: z.array(SecondBySecondSceneSchema).describe("An array of scene objects, one for each second of the video duration.")
});
export type VideoScriptOutput = z.infer<typeof ScriptGenerationOutputSchema>;


export async function generateVideoScript(input: VideoScriptInput): Promise<VideoScriptOutput> {
  return generateVideoScriptFlow(input);
}

const generateScriptContentPrompt = ai.definePrompt({
    name: 'generateScriptContentPrompt',
    input: {schema: VideoScriptInputSchema},
    output: {schema: ScriptGenerationOutputSchema},
    prompt: `You are an expert screenwriter. Your task is to generate the creative content for a video script, second by second. You MUST generate an array of scene objects, where the length of the array exactly matches the scene duration in seconds (e.g., 5 seconds = 5 objects).

For each second (each object in the array), you MUST provide content for the following fields, respecting the language constraints with NO EXCEPTIONS:

1.  **visualDescription (ENGLISH ONLY)**: A detailed description of the visuals (camera, actions, expressions). This MUST be in ENGLISH. Incorporate all details about the character's appearance, the scene setting, and the specified camera angle.
2.  **audioDialogue (BRAZILIAN PORTUGUESE ONLY)**: The dialogue spoken in that second. This MUST be in BRAZILIAN PORTUGUESE and include emotional cues in English, like (Surprised). If no specific dialogue is provided, create one that fits the context.
3.  **sfx (ENGLISH ONLY)**: The sound effects or ambient sounds. This field MUST be in ENGLISH.

**CRITICAL CONTEXT (MUST USE ALL PROVIDED INFO):**
- Influencer Name: {{{influencerName}}}
- Influencer Personality: {{{influencerPersonality}}}
- Influencer Appearance: {{{influencerAppearance}}}
- Scene Title: {{{sceneTitle}}}
- Scene Setting: {{{sceneSetting}}}
- Scene Action: {{{sceneAction}}}
- Camera Angle: {{{sceneCameraAngle}}}
- Scene Duration: {{{sceneDuration}}}
- Base Dialogue (use if provided, otherwise create): {{#if sceneDialogue}}{{{sceneDialogue}}}{{else}}Nenhum diálogo especificado.{{/if}}

**PRODUCT INTEGRATION (CRITICAL):**
{{#if productName}}
You MUST naturally and seamlessly integrate the following product into the script's visual descriptions and dialogue.
- **Product Name:** {{{productName}}}
- **Product Brand:** {{{productBrand}}}
- **Product Description:** {{{productDescription}}}
- **Is Partnership:** {{{isPartnership}}}
{{/if}}
`,
});

const generateVideoScriptFlow = ai.defineFlow(
  {
    name: 'generateVideoScriptFlow',
    inputSchema: VideoScriptInputSchema,
    outputSchema: ScriptGenerationOutputSchema,
  },
  async (input) => {
    let processedInput = { ...input };
    if (processedInput.sceneCameraAngle === 'Câmera Dinâmica (Criatividade da IA)') {
      processedInput.sceneCameraAngle = "Be creative and use dynamic, professional camera angles. Utilize a variety of shots, such as close-ups, wide shots, tracking shots, and point-of-view shots to make the scene visually engaging, as if directed by a filmmaker.";
    }

    // 1. Generate the structured content from the AI
    const { output } = await generateScriptContentPrompt(processedInput);
    
    if (!output || !output.scenes || output.scenes.length === 0) {
        throw new Error("AI failed to generate script content. Please try again.");
    }
    
    return output;
  }
);

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
  outputFormat: z.enum(['json', 'markdown']).describe('The desired output format: json or markdown.'),
  influencerAccent: z.string().describe('The accent of the influencer in Portuguese.'),
});
export type VideoScriptInput = z.infer<typeof VideoScriptInputSchema>;

const VideoScriptOutputSchema = z.string().describe('The generated video script prompt, in JSON or Markdown format.');
export type VideoScriptOutput = z.infer<typeof VideoScriptOutputSchema>;

const JsonOutputInternalSchema = z.object({
  prompt: z.string().describe("A detailed prompt for a screenwriter AI to generate a video script, incorporating all the user's specifications. This prompt itself should instruct the AI to produce a JSON object containing the script.")
});

const MarkdownOutputInternalSchema = z.object({
  markdownPrompt: z.string().describe("A detailed prompt in Markdown format for a screenwriter AI. This prompt should incorporate all the user's specifications and instruct the AI on how to structure the final script.")
});

export async function generateVideoScript(input: VideoScriptInput): Promise<VideoScriptOutput> {
  return generateVideoScriptFlow(input);
}

const promptBase = `You are an expert prompt engineer. Your task is to create a detailed prompt that will be given to a powerful AI to generate a video script.

The final output should be a single block of text, which can be directly used as a prompt for the script-generating AI.

Here are the specifications to include in the prompt you generate:

**1. Influencer:**
- Name: {{{influencerName}}}
- Personality: {{{influencerPersonality}}}
- Appearance: {{{influencerAppearance}}}
- Niche: {{{influencerNiche}}}

**2. Scene Details:**
- Title: {{{sceneTitle}}}
- Setting: {{{sceneSetting}}}
- Action: {{{sceneAction}}}
{{#if sceneDialogue}}
- Main Dialogue Idea: {{{sceneDialogue}}}
{{/if}}

**3. Product Integration (if applicable):**
{{#if productName}}
- Product Name: {{{productName}}}
{{/if}}
{{#if productBrand}}
- Product Brand: {{{productBrand}}}
{{/if}}
{{#if productDescription}}
- Product Description: {{{productDescription}}}
{{/if}}
{{#if isPartnership}}
- Partnership: Yes
{{/if}}

**4. Technical Details:**
- Camera Angle: {{{sceneCameraAngle}}}
- Duration: {{{sceneDuration}}}
- Video Format: {{{sceneVideoFormat}}}
- Digital Text Allowed: {{#if allowDigitalText}}Yes{{else}}No{{/if}}
- Only Physical Text Allowed: {{#if onlyPhysicalText}}Yes{{else}}No{{/if}}

**Output Instructions for the Prompt You Are Generating:**`;

const jsonPromptInstructions = `Your task is to generate the content for the 'prompt' field. This content should be a comprehensive set of instructions for a screenwriter AI. These instructions must command the AI to generate a video script as a single JSON object with a specific structure: { "title": "...", "synopsis": "...", "script": [ { "timecode": "...", "visuals": "...", "dialogue": "...", "sfx": "...", "text_overlay": "..." } ] }. The instructions you create must incorporate all the specifications provided in the context above. The "dialogue" in the final script's JSON must be in **Brazilian Portuguese**, matching the influencer's accent: {{{influencerAccent}}}. All other fields in the script JSON should be in English.`;
const markdownPromptInstructions = `Your task is to generate the content for the 'markdownPrompt' field. This content should be a comprehensive and detailed prompt in **Markdown format** for a screenwriter AI. This prompt must instruct the AI to create a video script using Markdown headings, lists, and bold/italic text for structure. The prompt must incorporate all the specifications provided in the context above. The dialogue in the final script must be in **Brazilian Portuguese**, matching the influencer's accent: {{{influencerAccent}}}. All other descriptive parts of the script should be in English.`;

const generateJsonPrompt = ai.definePrompt({
    name: 'generateJsonVideoScriptPrompt',
    input: {schema: VideoScriptInputSchema},
    output: {schema: JsonOutputInternalSchema},
    prompt: `${promptBase}\n\n${jsonPromptInstructions}`
});

const generateMarkdownPrompt = ai.definePrompt({
    name: 'generateMarkdownVideoScriptPrompt',
    input: {schema: VideoScriptInputSchema},
    output: {schema: MarkdownOutputInternalSchema},
    prompt: `${promptBase}\n\n${markdownPromptInstructions}`
});


const generateVideoScriptFlow = ai.defineFlow(
  {
    name: 'generateVideoScriptFlow',
    inputSchema: VideoScriptInputSchema,
    outputSchema: VideoScriptOutputSchema,
  },
  async input => {
    if (input.outputFormat === 'markdown') {
        const {output} = await generateMarkdownPrompt(input);
        if (!output || !output.markdownPrompt) {
            throw new Error("A geração do prompt em Markdown falhou ao não retornar dados. Tente novamente.");
        }
        return output.markdownPrompt;
    }
    
    const {output} = await generateJsonPrompt(input);
    if (!output || !output.prompt) {
        throw new Error("A geração do prompt em JSON falhou ao não retornar dados. Tente novamente.");
    }
    // Convert the structured JSON output back to a string to match the flow's output schema
    return JSON.stringify(output);
  }
);

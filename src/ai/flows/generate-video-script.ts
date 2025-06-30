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

export async function generateVideoScript(input: VideoScriptInput): Promise<VideoScriptOutput> {
  return generateVideoScriptFlow(input);
}

const promptBase = `You are an expert prompt engineer. Your task is to create a detailed prompt that will be given to a powerful AI to generate a video script.

The final output should be a single block of text, formatted as {{outputFormat}}, which can be directly used as a prompt for the script-generating AI.

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

const jsonPromptInstructions = `Generate a single, well-formatted JSON object. This object must contain a single key called "prompt". The value of this "prompt" key must be a string containing the complete and detailed instructions for a screenwriter AI. This instructional prompt should command the AI to generate a video script as a JSON object with a specific structure: { "title": "...", "synopsis": "...", "script": [ { "timecode": "...", "visuals": "...", "dialogue": "...", "sfx": "...", "text_overlay": "..." } ] }. The prompt you create must incorporate all the specifications provided above. The "dialogue" field within the final script's JSON must be in **Brazilian Portuguese**, matching the influencer's accent: {{{influencerAccent}}}. All other fields should be in English. The final output from you must be ONLY the JSON object.`;
const markdownPromptInstructions = `Generate a comprehensive and detailed prompt in **Markdown format**. This prompt should clearly instruct a screenwriter AI to create a video script. It must contain all the specifications provided above. The tone should be clear and direct. The final output from you should be only the generated prompt text, without any additional explanations or introductions. The dialogue in the script must be in **Brazilian Portuguese**, matching the influencer's accent: {{{influencerAccent}}}. All other descriptive parts of the script should be in English.`;

const generateJsonPrompt = ai.definePrompt({
    name: 'generateJsonVideoScriptPrompt',
    input: {schema: VideoScriptInputSchema},
    output: {schema: VideoScriptOutputSchema},
    prompt: `${promptBase}\n\n${jsonPromptInstructions}`
});

const generateMarkdownPrompt = ai.definePrompt({
    name: 'generateMarkdownVideoScriptPrompt',
    input: {schema: VideoScriptInputSchema},
    output: {schema: VideoScriptOutputSchema},
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
        return output!;
    }
    const {output} = await generateJsonPrompt(input);
    return output!;
  }
);

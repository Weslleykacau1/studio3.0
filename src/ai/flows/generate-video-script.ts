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

const VideoScriptOutputSchema = z.string().describe('The generated video script, in JSON or Markdown format.');
export type VideoScriptOutput = z.infer<typeof VideoScriptOutputSchema>;

export async function generateVideoScript(input: VideoScriptInput): Promise<VideoScriptOutput> {
  return generateVideoScriptFlow(input);
}

const generateVideoScriptPrompt = ai.definePrompt({
  name: 'generateVideoScriptPrompt',
  input: {schema: VideoScriptInputSchema},
  output: {schema: VideoScriptOutputSchema},
  prompt: `You are a professional screenwriter for short videos (TikTok/Reels style).

Create a detailed script for a video based on the following specifications, formatted in clean, readable Markdown.

**Script Specifications:**

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


**Output Instructions:**
{{#eq outputFormat "markdown"}}
- Use Markdown headings (#, ##) for the main sections like Title, Synopsis, and Script.
- For each moment in the script, use a subheading (###) or bold text for the timecode (e.g., **0s-2s**).
- Use bold text for labels like **Visuals:**, **Dialogue:**, **SFX:**.
- CRITICAL: The "Dialogue" MUST be in **Brazilian Portuguese**, matching the influencer's accent: {{{influencerAccent}}}. If no dialogue idea is provided, leave this section blank.
- All other descriptive text (Visuals, SFX, Synopsis, etc.) should be in English.
- Format the final output for maximum readability.
{{else}}
You are a professional screenwriter for short videos (TikTok/Reels style). Create a detailed script for a video based on the following specifications. The response MUST be a well-formatted JSON object, with no additional text or markdown formatting. **Script Specifications:** **1. Influencer:** - **Name:** {{{influencerName}}} - **Personality:** {{{influencerPersonality}}} - **Appearance:** {{{influencerAppearance}}} - **Niche:** {{{influencerNiche}}} **2. Scene Details:** - **Title:** {{{sceneTitle}}} - **Setting:** {{{sceneSetting}}} - **Action:** {{{sceneAction}}} {{#if sceneDialogue}} - **Main Dialogue Idea:** {{{sceneDialogue}}} {{/if}} **Output Instructions:** Generate a script in JSON format with the following structure. { "title": "Video Title (in English)", "synopsis": "A brief one-sentence summary of the video (in English).", "script": [ { "timecode": "0s-2s", "visuals": "Detailed description of what is seen on screen. Include the influencer's actions, facial expressions, and camera movements (in English).", "dialogue": "The exact speech of the influencer. IMPORTANT: This field MUST be in **Brazilian Portuguese**, matching their accent: {{{influencerAccent}}}. If no dialogue idea is provided, this should be an empty string.", "sfx": "Sound effects (e.g., 'clicking sound', 'soft suspenseful music') (in English).", "text_overlay": "Text that appears on the screen (only if allowed, in English)." } ] } Use the influencer's personality and unique trait to guide their tone and actions. The visual description should be vivid and cinematic.
{{/eq}}
`,
});

const generateVideoScriptFlow = ai.defineFlow(
  {
    name: 'generateVideoScriptFlow',
    inputSchema: VideoScriptInputSchema,
    outputSchema: VideoScriptOutputSchema,
  },
  async input => {
    const {output} = await generateVideoScriptPrompt(input);
    return output!;
  }
);

'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a structured JSON video script.
 *
 * It exports:
 * - `generateJsonScript` - An async function that takes comprehensive input and returns a structured JSON script.
 * - `GenerateJsonScriptInput` - The input type for the function.
 * - `GenerateJsonScriptOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateJsonScriptInputSchema = z.object({
  influencerName: z.string().describe('The name of the influencer.'),
  influencerAppearance: z.string().describe('A detailed physical description of the influencer (face, hair, body type, etc.).'),
  influencerClothing: z.string().describe('The clothing style of the influencer.'),
  sceneTitle: z.string().describe('The title of the video scene.'),
  sceneSetting: z.string().describe('A detailed description of the scene setting.'),
  sceneDuration: z.string().describe('The duration of the scene (e.g., "8 seg").'),
  sceneVideoFormat: z.string().describe('The video format (e.g., "9:16 (Vertical)").'),
  sceneCameraAngle: z.string().describe('The camera angle for the scene.'),
  productName: z.string().optional().describe('The name of the product being featured (if any).'),
  productDescription: z.string().optional().describe('Detailed description of the product.'),
});
export type GenerateJsonScriptInput = z.infer<typeof GenerateJsonScriptInputSchema>;

const SceneDetailSchema = z.object({
  id: z.number().describe('The sequential ID of the scene, starting from 1.'),
  start_time: z.number().describe('The start time of this segment in seconds.'),
  end_time: z.number().describe('The end time of this segment in seconds.'),
  visual_prompt: z.string().describe('A detailed visual prompt in English for an image/video generator, describing the action, setting, and character for this specific time segment. This must be in English.'),
  camera_direction: z.string().describe('Specific camera direction for this segment (e.g., "Close-up on face", "Wide shot showing the environment"). This must be in English.'),
  expression: z.string().describe('The character\'s facial expression (e.g., "Surprised", "Happy", "Thoughtful"). This must be in English.'),
  dialogue: z.string().optional().describe('The dialogue spoken by the character during this segment. This must be in Brazilian Portuguese (pt-BR).'),
});

export const GenerateJsonScriptOutputSchema = z.object({
  title: z.string().describe('The title of the video script.'),
  duration_seconds: z.number().describe('The total duration of the video in seconds.'),
  format: z.string().describe('The video format, extracted from the input (e.g., "16:9", "9:16").'),
  language: z.literal('pt-BR').describe('The primary language of the dialogue.'),
  character: z.object({
    name: z.string().describe("The character's name."),
    appearance: z.string().describe("A detailed description of the character's physical appearance."),
    style: z.string().describe("A description of the character's clothing style."),
  }),
  scenes: z.array(SceneDetailSchema).describe('An array of scene objects, detailing the script second by second.'),
   product_integration: z.object({
    is_present: z.boolean().describe('Whether a product is present and integrated into the script.'),
    product_name: z.string().optional().describe('The name of the product.'),
    integration_description: z.string().optional().describe('A brief summary of how the product was integrated into the visual prompts and dialogue.'),
  }).optional().describe('Details about product integration in the script.'),
});
export type GenerateJsonScriptOutput = z.infer<typeof GenerateJsonScriptOutputSchema>;


export async function generateJsonScript(input: GenerateJsonScriptInput): Promise<GenerateJsonScriptOutput> {
  return generateJsonScriptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateJsonScriptPrompt',
    input: {schema: GenerateJsonScriptInputSchema},
    output: {schema: GenerateJsonScriptOutputSchema},
    prompt: `You are an expert video scriptwriter who produces structured JSON output. Your task is to create a complete video script based on the provided details. The output MUST be a valid JSON object adhering to the specified schema.

**CRITICAL INSTRUCTIONS:**
1.  **Duration & Pacing:** The 'scenes' array must be broken down into segments. The total duration of all segments MUST equal the 'duration_seconds' field. A duration of '8 seg' means the 'duration_seconds' field must be 8.
2.  **Language Requirements:**
    -   `visual_prompt`, `camera_direction`, `expression`: These fields MUST be in **English**.
    -   `dialogue`: This field MUST be in **pt-BR** (Brazilian Portuguese).
3.  **Product Integration:**
    -   {{#if productName}}
        You MUST naturally integrate the product '{{{productName}}}' into the 'visual_prompt' and 'dialogue' fields. The 'product_integration' object in the output MUST be populated, with 'is_present' set to true.
        {{else}}
        No product is specified. The 'product_integration' object should indicate that no product is present by setting 'is_present' to false.
        {{/if}}
4.  **Field Mapping:**
    -   `title`: Use `sceneTitle`.
    -   `duration_seconds`: Convert `sceneDuration` (e.g., "8 seg") into a number.
    -   `format`: Extract from `sceneVideoFormat` (e.g., "9:16 (Vertical)" becomes "9:16").
    -   `language`: Must always be "pt-BR".
    -   `character.name`: Use `influencerName`.
    -   `character.appearance`: Use `influencerAppearance`.
    -   `character.style`: Use `influencerClothing`.

**INPUT DATA:**
-   **Scene Title:** {{{sceneTitle}}}
-   **Scene Duration:** {{{sceneDuration}}}
-   **Video Format:** {{{sceneVideoFormat}}}
-   **Influencer Name:** {{{influencerName}}}
-   **Influencer Appearance:** {{{influencerAppearance}}}
-   **Influencer Clothing:** {{{influencerClothing}}}
-   **Scene Setting:** {{{sceneSetting}}}
-   **Camera Angle:** {{{sceneCameraAngle}}}
-   **Product Name:** {{#if productName}}'{{{productName}}}'{{else}}N/A{{/if}}
-   **Product Description:** {{#if productDescription}}'{{{productDescription}}}'{{else}}N/A{{/if}}

Generate the JSON script now.
`
});

const generateJsonScriptFlow = ai.defineFlow(
  {
    name: 'generateJsonScriptFlow',
    inputSchema: GenerateJsonScriptInputSchema,
    outputSchema: GenerateJsonScriptOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("AI failed to generate JSON script content.");
    }
    return output;
  }
);

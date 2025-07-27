
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating thumbnail ideas from a user-provided script.
 *
 * It exports:
 * - `generateThumbnailFromScript` - An async function that takes a script and returns thumbnail ideas and two generated images.
 * - `GenerateThumbnailFromScriptInput` - The input type for the function.
 * - `GenerateThumbnailFromScriptOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateThumbnailFromScriptInputSchema = z.object({
  scriptText: z.string().describe('The full text of the video script.'),
});
export type GenerateThumbnailFromScriptInput = z.infer<typeof GenerateThumbnailFromScriptInputSchema>;

const GenerateThumbnailFromScriptOutputSchema = z.object({
  title: z.string().describe('A catchy, viral, clickbait-style title for the video, in Brazilian Portuguese.'),
  overlayText: z.string().describe('A very short, high-impact text to overlay on the thumbnail image (max 5 words), in Brazilian Portuguese.'),
  styleDescription: z.string().describe('A description of the recommended visual style for the thumbnail, including fonts, colors, and effects.'),
  emoji: z.string().describe('A single, relevant emoji that could be used in the title or on the thumbnail to grab attention.'),
  generatedImage1DataUri: z.string().url().describe("The first generated thumbnail image variant, as a data URI."),
  generatedImage2DataUri: z.string().url().describe("The second generated thumbnail image variant, as a data URI."),
});
export type GenerateThumbnailFromScriptOutput = z.infer<typeof GenerateThumbnailFromScriptOutputSchema>;

export async function generateThumbnailFromScript(input: GenerateThumbnailFromScriptInput): Promise<GenerateThumbnailFromScriptOutput> {
  return generateThumbnailFromScriptFlow(input);
}

const TextIdeasSchema = z.object({
    title: z.string().describe('A catchy, viral, clickbait-style title for the video, based on the script, in Brazilian Portuguese.'),
    overlayText: z.string().describe('A very short, high-impact text to overlay on the thumbnail image (max 5 words), based on the script, in Brazilian Portuguese.'),
    styleDescription: z.string().describe('A description of a recommended high-impact visual style for the thumbnail, including fonts, colors, and effects.'),
    emoji: z.string().describe('A single, powerful emoji to use in the title or thumbnail, relevant to the script.'),
    mainImagePrompt: z.string().describe('A detailed prompt for an AI image generator to create the main visual of the thumbnail based on the most impactful scene of the script. This prompt should be in English.')
});

const textIdeasPrompt = ai.definePrompt({
  name: 'generateThumbnailTextFromScriptPrompt',
  input: {schema: GenerateThumbnailFromScriptInputSchema},
  output: {schema: TextIdeasSchema},
  prompt: `You are a specialist in creating viral video content. Analyze the provided script and generate ideas for a highly clickable thumbnail.

The output must be in JSON format.

Based on the script, generate:
1.  **title**: A highly engaging, "clickbait" title that creates curiosity (in Brazilian Portuguese).
2.  **overlayText**: A very short (max 5 words) and impactful text to be placed on the thumbnail (in Brazilian Portuguese).
3.  **styleDescription**: A description of a suggested high-impact visual style with bold fonts, vibrant colors, and attention-grabbing elements.
4.  **emoji**: Suggest a single, powerful emoji relevant to the script's theme.
5.  **mainImagePrompt**: A detailed prompt in **English** for an AI image generator to create the main visual for the thumbnail. This prompt should describe the most visually interesting or emotionally charged moment from the script.

**Video Script to Analyze:**
"""
{{{scriptText}}}
"""
  `
});

const generateThumbnailFromScriptFlow = ai.defineFlow(
  {
    name: 'generateThumbnailFromScriptFlow',
    inputSchema: GenerateThumbnailFromScriptInputSchema,
    outputSchema: GenerateThumbnailFromScriptOutputSchema,
  },
  async (input) => {
    // 1. Generate text ideas and the base image prompt from the script
    const { output: ideas } = await textIdeasPrompt(input);
    if (!ideas) {
      throw new Error('Failed to generate thumbnail ideas from the script.');
    }

    // 2. Create two variations of the final image generation prompt
    const imageGenPromptText1 = `Generate a viral YouTube thumbnail based on this core idea: "${ideas.mainImagePrompt}". The image must be in cinematic quality, 8k, photorealistic, and highly detailed, in a 16:9 landscape aspect ratio. It must prominently feature the overlay text "${ideas.overlayText}" using a bold, impactful, and easy-to-read font. The visual style MUST follow this description: "${ideas.styleDescription}".`;
    const imageGenPromptText2 = `Generate a second, different version of the viral YouTube thumbnail based on the same core idea: "${ideas.mainImagePrompt}". Use a more dramatic angle or a different emotional focus, but it MUST follow the same visual style: "${ideas.styleDescription}". The image must also prominently feature the text "${ideas.overlayText}" using a bold, impactful, and easy-to-read font, perhaps with a different color or placement. The image must be in a 16:9 landscape aspect ratio.`;

    // 3. Generate both images in parallel
    const [image1Result, image2Result] = await Promise.all([
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: imageGenPromptText1,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: imageGenPromptText2,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    ]);
    
    const image1 = image1Result.media;
    const image2 = image2Result.media;

    if (!image1?.url || !image2?.url) {
        throw new Error("Failed to generate images for the thumbnail.");
    }
    
    // 4. Combine text ideas with generated images for the final output
    return {
      title: ideas.title,
      overlayText: ideas.overlayText,
      styleDescription: ideas.styleDescription,
      emoji: ideas.emoji,
      generatedImage1DataUri: image1.url,
      generatedImage2DataUri: image2.url,
    };
  }
);

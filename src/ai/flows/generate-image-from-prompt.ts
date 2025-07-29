'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating an image from a text prompt.
 *
 * It exports:
 * - `generateImageFromPrompt` - An async function that takes a prompt and returns an image data URI.
 * - `GenerateImageFromPromptInput` - The input type for the function.
 * - `GenerateImageFromPromptOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageFromPromptInputSchema = z.object({
  prompt: z.string().describe('The detailed text prompt for the image generation model.'),
});
export type GenerateImageFromPromptInput = z.infer<typeof GenerateImageFromPromptInputSchema>;

const GenerateImageFromPromptOutputSchema = z.object({
  imageDataUri: z.string().url().describe("The generated image, as a data URI."),
});
export type GenerateImageFromPromptOutput = z.infer<typeof GenerateImageFromPromptOutputSchema>;


export async function generateImageFromPrompt(input: GenerateImageFromPromptInput): Promise<GenerateImageFromPromptOutput> {
  return generateImageFromPromptFlow(input);
}

const generateImageFromPromptFlow = ai.defineFlow(
  {
    name: 'generateImageFromPromptFlow',
    inputSchema: GenerateImageFromPromptInputSchema,
    outputSchema: GenerateImageFromPromptOutputSchema,
  },
  async ({ prompt }) => {
    
    const imageGenPromptText = `Generate a high-quality, cinematic image based on this prompt: "${prompt}". The image should be in a 16:9 landscape aspect ratio, photorealistic, and highly detailed.`;
    
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: imageGenPromptText,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media?.url) {
        throw new Error("Failed to generate an image for the provided prompt.");
    }
    
    return {
      imageDataUri: media.url,
    };
  }
);

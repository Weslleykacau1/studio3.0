'use server';
/**
 * @fileOverview Analyzes an image and generates thumbnail ideas for a viral video.
 *
 * - generateThumbnailIdeas - A function that handles the thumbnail idea generation process.
 * - GenerateThumbnailIdeasInput - The input type for the function.
 * - GenerateThumbnailIdeasOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateThumbnailIdeasInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The image to be used as a base for the thumbnail, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateThumbnailIdeasInput = z.infer<typeof GenerateThumbnailIdeasInputSchema>;

const GenerateThumbnailIdeasOutputSchema = z.object({
  title: z.string().describe('A catchy, viral, clickbait-style title for the video, in Brazilian Portuguese.'),
  overlayText: z.string().describe('A very short, high-impact text to overlay on the thumbnail image (max 5 words), in Brazilian Portuguese.'),
  styleDescription: z.string().describe('A description of the recommended visual style for the thumbnail, including fonts, colors, and effects.'),
  emoji: z.string().describe('A single, relevant emoji that could be used in the title or on the thumbnail to grab attention.'),
});
export type GenerateThumbnailIdeasOutput = z.infer<typeof GenerateThumbnailIdeasOutputSchema>;

export async function generateThumbnailIdeas(input: GenerateThumbnailIdeasInput): Promise<GenerateThumbnailIdeasOutput> {
  return generateThumbnailIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateThumbnailIdeasPrompt',
  input: {schema: GenerateThumbnailIdeasInputSchema},
  output: {schema: GenerateThumbnailIdeasOutputSchema},
  prompt: `You are a specialist in creating viral video thumbnails for platforms like YouTube and TikTok. Analyze the provided image and generate ideas to make it a highly clickable thumbnail.

The output must be in **Brazilian Portuguese**.

Based on the image, generate:
1.  **title**: A highly engaging, "clickbait" title that creates curiosity.
2.  **overlayText**: A very short (max 5 words) and impactful text to be placed directly on the thumbnail. This should complement the title and image.
3.  **styleDescription**: Describe the visual treatment. Suggest bold font types, vibrant color palettes (e.g., "high-contrast red and yellow"), effects like outlines or drop shadows on the text, and any other elements to maximize impact.
4.  **emoji**: Suggest a single, powerful emoji to use in the title or thumbnail.

Image for analysis:
{{media url=imageDataUri}}`,
});

const generateThumbnailIdeasFlow = ai.defineFlow(
  {
    name: 'generateThumbnailIdeasFlow',
    inputSchema: GenerateThumbnailIdeasInputSchema,
    outputSchema: GenerateThumbnailIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

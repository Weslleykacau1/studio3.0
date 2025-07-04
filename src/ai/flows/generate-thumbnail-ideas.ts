'use server';
/**
 * @fileOverview Analyzes an influencer photo and a style reference thumbnail, generates thumbnail ideas, and creates two sample thumbnail images.
 *
 * - generateThumbnailIdeas - A function that handles the thumbnail idea and image generation process.
 * - GenerateThumbnailIdeasInput - The input type for the function.
 * - GenerateThumbnailIdeasOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateThumbnailIdeasInputSchema = z.object({
  influencerPhotoDataUri: z
    .string()
    .describe(
      "A photo of the influencer, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  styleReferenceThumbnailDataUri: z
    .string()
    .describe(
      "A reference thumbnail image for style inspiration, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateThumbnailIdeasInput = z.infer<typeof GenerateThumbnailIdeasInputSchema>;

const GenerateThumbnailIdeasOutputSchema = z.object({
  title: z.string().describe('A catchy, viral, clickbait-style title for the video, in Brazilian Portuguese.'),
  overlayText: z.string().describe('A very short, high-impact text to overlay on the thumbnail image (max 5 words), in Brazilian Portuguese.'),
  styleDescription: z.string().describe('A description of the recommended visual style for the thumbnail, including fonts, colors, and effects.'),
  emoji: z.string().describe('A single, relevant emoji that could be used in the title or on the thumbnail to grab attention.'),
  generatedImage1DataUri: z.string().url().describe("The first generated thumbnail image variant, as a data URI."),
  generatedImage2DataUri: z.string().url().describe("The second generated thumbnail image variant, as a data URI."),
});
export type GenerateThumbnailIdeasOutput = z.infer<typeof GenerateThumbnailIdeasOutputSchema>;

export async function generateThumbnailIdeas(input: GenerateThumbnailIdeasInput): Promise<GenerateThumbnailIdeasOutput> {
  return generateThumbnailIdeasFlow(input);
}

const TextIdeasSchema = z.object({
    title: z.string().describe('A catchy, viral, clickbait-style title for the video, in Brazilian Portuguese.'),
    overlayText: z.string().describe('A very short, high-impact text to overlay on the thumbnail image (max 5 words), in Brazilian Portuguese.'),
    styleDescription: z.string().describe('A description of the recommended visual style for the thumbnail, including fonts, colors, and effects.'),
    emoji: z.string().describe('A single, relevant emoji that could be used in the title or on the thumbnail to grab attention.'),
});

const textIdeasPrompt = ai.definePrompt({
  name: 'generateThumbnailTextIdeasPrompt',
  input: {schema: GenerateThumbnailIdeasInputSchema},
  output: {schema: TextIdeasSchema},
  prompt: `You are a specialist in creating viral video thumbnails for platforms like YouTube and TikTok. Analyze the provided influencer photo and the reference thumbnail to generate ideas to make a highly clickable final thumbnail.

The output must be in **Brazilian Portuguese**.

Based on the images, generate:
1.  **title**: A highly engaging, "clickbait" title that creates curiosity, related to the influencer image.
2.  **overlayText**: A very short (max 5 words) and impactful text to be placed directly on the thumbnail. This should complement the title and image.
3.  **styleDescription**: Describe the visual treatment based *only* on the reference thumbnail. Suggest bold font types, vibrant color palettes (e.g., "high-contrast red and yellow"), effects like outlines or drop shadows on the text, and any other elements to maximize impact.
4.  **emoji**: Suggest a single, powerful emoji to use in the title or thumbnail.

Influencer Photo for analysis:
{{media url=influencerPhotoDataUri}}

Style Reference Thumbnail for analysis:
{{media url=styleReferenceThumbnailDataUri}}`,
});

const generateThumbnailIdeasFlow = ai.defineFlow(
  {
    name: 'generateThumbnailIdeasFlow',
    inputSchema: GenerateThumbnailIdeasInputSchema,
    outputSchema: GenerateThumbnailIdeasOutputSchema,
  },
  async (input) => {
    const { output: textIdeas } = await textIdeasPrompt(input);
    if (!textIdeas) {
      throw new Error('Falha ao gerar as ideias de texto para a thumbnail.');
    }

    const imageGenPromptText1 = `Generate a viral YouTube thumbnail. The main subject is the person in the influencer photo. Recreate the style (colors, fonts, composition) from the reference thumbnail. The video is about: "${textIdeas.title}". The image should be visually striking and eye-catching. Do NOT include any text in the image.`;
    const imageGenPromptText2 = `Generate a second, different version of a viral YouTube thumbnail. The subject is the person in the influencer photo. Recreate the style of the reference thumbnail. The video is about: "${textIdeas.title}". Make this version more dramatic or use a different angle. Do NOT include any text in the image.`;
    
    const [image1Result, image2Result] = await Promise.all([
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: [
          { media: { url: input.influencerPhotoDataUri } },
          { media: { url: input.styleReferenceThumbnailDataUri } },
          { text: imageGenPromptText1 },
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: [
          { media: { url: input.influencerPhotoDataUri } },
          { media: { url: input.styleReferenceThumbnailDataUri } },
          { text: imageGenPromptText2 },
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
    ]);
    
    const image1 = image1Result.media;
    const image2 = image2Result.media;

    if (!image1?.url || !image2?.url) {
        throw new Error("Falha ao gerar imagens para a thumbnail.");
    }
    
    return {
      ...textIdeas,
      generatedImage1DataUri: image1.url,
      generatedImage2DataUri: image2.url,
    };
  }
);

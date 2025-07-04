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
  videoTheme: z.string().describe('The theme or topic of the video.'),
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
  prompt: `You are a specialist in creating viral video thumbnails in the style of MrBeast. Analyze the provided influencer photo and video theme to generate ideas for a highly clickable thumbnail.

The output must be in **Brazilian Portuguese**.

Based on the image and theme, generate:
1.  **title**: A highly engaging, "clickbait" title that creates curiosity, related to the influencer image and video theme.
2.  **overlayText**: A very short (max 5 words) and impactful text to be placed directly on the thumbnail. This should complement the title and image.
3.  **styleDescription**: Describe the MrBeast visual style. It should include: bold, sans-serif fonts (like 'Komika Axis'), vibrant and high-contrast colors (yellows, blues, reds), attention-grabbing elements like circles or arrows, and exaggerated facial expressions.
4.  **emoji**: Suggest a single, powerful emoji to use in the title or thumbnail.

**Video Theme:**
{{{videoTheme}}}

Influencer Photo for analysis:
{{media url=influencerPhotoDataUri}}`,
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

    const imageGenPromptText1 = `Generate a viral YouTube thumbnail in the style of MrBeast. The video is about: "${input.videoTheme}". The main subject is the person in the influencer photo. The image should be visually striking, with high contrast, vibrant colors, and an exaggerated expression on the person's face. Do NOT include any text in the image.`;
    const imageGenPromptText2 = `Generate a second, different version of a viral YouTube thumbnail in the style of MrBeast. The video is about: "${input.videoTheme}". The subject is the person in the influencer photo. Make this version more dramatic or use a different angle, maintaining the high-energy, high-contrast MrBeast style. Do NOT include any text in the image.`;
    
    const [image1Result, image2Result] = await Promise.all([
      ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: [
          { media: { url: input.influencerPhotoDataUri } },
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

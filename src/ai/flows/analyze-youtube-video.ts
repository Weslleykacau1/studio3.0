'use server';

/**
 * @fileOverview Analyzes a YouTube video to create an inspired scene.
 *
 * - analyzeYouTubeVideo - Uses AI to generate an original scene based on the video's style and content.
 * - AnalyzeYouTubeVideoInput - Input schema for the flow.
 * - AnalyzeYouTubeVideoOutput - Output schema for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeYouTubeVideoInputSchema = z.object({
  youtubeUrl: z.string().url().describe('The URL of the YouTube video to analyze.'),
});
export type AnalyzeYouTubeVideoInput = z.infer<typeof AnalyzeYouTubeVideoInputSchema>;

const AnalyzeYouTubeVideoOutputSchema = z.object({
  title: z.string().describe('A catchy title for the new scene, inspired by the video, in Brazilian Portuguese.'),
  setting: z.string().describe("A detailed description of the new scene's setting, inspired by the video, in Brazilian Portuguese."),
  action: z.string().describe('An original main action for the new scene, inspired by the video, in Brazilian Portuguese.'),
});
export type AnalyzeYouTubeVideoOutput = z.infer<typeof AnalyzeYouTubeVideoOutputSchema>;

export async function analyzeYouTubeVideo(input: AnalyzeYouTubeVideoInput): Promise<AnalyzeYouTubeVideoOutput> {
  return analyzeYouTubeVideoFlow(input);
}

const analyzeVideoPrompt = ai.definePrompt({
    name: 'analyzeVideoPrompt',
    input: { schema: AnalyzeYouTubeVideoInputSchema },
    output: { schema: AnalyzeYouTubeVideoOutputSchema },
    prompt: `You are a creative director and scriptwriter tasked with creating a new video scene inspired by an existing YouTube video. Your goal is to capture the original video's **style, theme, and energy**, but create a **new, original scene without dialogue**.

Your response MUST be in Brazilian Portuguese for all fields.

Based on the content of the YouTube video at the URL below, please generate the following for the new scene:
1.  **title**: A short, catchy title that reflects the new scene, but is in the same "clickbait" style as the original video.
2.  **setting**: Describe a detailed setting for the new scene that matches the vibe and context of the original video.
3.  **action**: Describe the main action for the new scene. It should be an original action that fits the influencer's style.

The new scene should be a fresh take, not a direct copy. Use the video at the URL below as your inspiration for the style and theme.

Video URL for inspiration:
{{{youtubeUrl}}}
`
});

const analyzeYouTubeVideoFlow = ai.defineFlow(
  {
    name: 'analyzeYouTubeVideoFlow',
    inputSchema: AnalyzeYouTubeVideoInputSchema,
    outputSchema: AnalyzeYouTubeVideoOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeVideoPrompt(input);

    if (!output) {
      throw new Error("A análise do vídeo não produziu um resultado. A URL pode estar inacessível ou o conteúdo não pôde ser analisado.");
    }
    
    return output;
  }
);

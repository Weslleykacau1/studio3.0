'use server';

/**
 * @fileOverview Analyzes a YouTube video transcript to generate scene properties.
 *
 * - analyzeYouTubeVideo - Fetches transcript and uses AI to generate scene details.
 * - AnalyzeYouTubeVideoInput - Input schema for the flow.
 * - AnalyzeYouTubeVideoOutput - Output schema for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { YoutubeTranscript } from 'youtube-transcript';

const AnalyzeYouTubeVideoInputSchema = z.object({
  youtubeUrl: z.string().url().describe('The URL of the YouTube video to analyze.'),
});
export type AnalyzeYouTubeVideoInput = z.infer<typeof AnalyzeYouTubeVideoInputSchema>;

const AnalyzeYouTubeVideoOutputSchema = z.object({
  title: z.string().describe('A catchy title for the scene based on the video content, in Brazilian Portuguese.'),
  setting: z.string().describe('A detailed description of the inferred scene setting, in Brazilian Portuguese.'),
  action: z.string().describe('The main action or event occurring in the video, in Brazilian Portuguese.'),
  dialogue: z.string().describe('A key or representative piece of dialogue from the video, in Brazilian Portuguese, with English emotional cues.'),
});
export type AnalyzeYouTubeVideoOutput = z.infer<typeof AnalyzeYouTubeVideoOutputSchema>;

export async function analyzeYouTubeVideo(input: AnalyzeYouTubeVideoInput): Promise<AnalyzeYouTubeVideoOutput> {
  return analyzeYouTubeVideoFlow(input);
}

const analyzeTranscriptPrompt = ai.definePrompt({
    name: 'analyzeTranscriptPrompt',
    input: { schema: z.object({ transcript: z.string() }) },
    output: { schema: AnalyzeYouTubeVideoOutputSchema },
    prompt: `You are a creative video script analyst. Your task is to analyze the following video transcript and extract the key elements to create a scene.

Your response MUST be in Brazilian Portuguese for all fields.

Based on the transcript, please provide:
1.  **title**: A short, catchy, "clickbait" style title that captures the essence of the video.
2.  **setting**: Infer and describe the physical environment or setting where the video likely takes place. Be descriptive. If it's not clear, suggest a plausible setting.
3.  **action**: Describe the main action or event happening in the scene. What are the people doing?
4.  **dialogue**: Extract a short, representative, and impactful piece of dialogue. **Crucially, this dialogue must include emotional cues in English (e.g., (surprised), (laughing)) and emphasize key words or phrases to guide an actor's performance.**

Transcript to analyze:
"""
{{{transcript}}}
"""
`
});

const analyzeYouTubeVideoFlow = ai.defineFlow(
  {
    name: 'analyzeYouTubeVideoFlow',
    inputSchema: AnalyzeYouTubeVideoInputSchema,
    outputSchema: AnalyzeYouTubeVideoOutputSchema,
  },
  async (input) => {
    let transcriptText = '';
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(input.youtubeUrl, { lang: 'pt' });
      transcriptText = transcript.map(t => t.text).join(' ');
    } catch (error) {
      console.warn(`Could not fetch 'pt' transcript for ${input.youtubeUrl}, trying default.`, error);
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(input.youtubeUrl);
        transcriptText = transcript.map(t => t.text).join(' ');
      } catch (fallbackError) {
        // Both failed, transcriptText remains empty. The check below will handle it.
        console.error(`Failed to fetch any transcript for ${input.youtubeUrl}`, fallbackError);
      }
    }

    if (!transcriptText.trim()) {
      throw new Error("Não foi possível obter a transcrição do vídeo. Verifique se o URL está correto e se o vídeo possui legendas em português ou inglês.");
    }
    
    const { output } = await analyzeTranscriptPrompt({ transcript: transcriptText });

    if (!output) {
      throw new Error("A análise da transcrição do vídeo não produziu um resultado.");
    }
    
    return output;
  }
);

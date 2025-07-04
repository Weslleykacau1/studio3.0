'use server';

/**
 * @fileOverview Analyzes a YouTube video to create an inspired scene.
 *
 * - analyzeYouTubeVideo - Fetches transcript and uses AI to generate an original scene based on the video's style.
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
  title: z.string().describe('A catchy title for the new scene, inspired by the video, in Brazilian Portuguese.'),
  setting: z.string().describe("A detailed description of the new scene's setting, inspired by the video, in Brazilian Portuguese."),
  action: z.string().describe('An original main action for the new scene, inspired by the video, in Brazilian Portuguese.'),
  dialogue: z.string().describe('An original piece of dialogue for the new scene, in Brazilian Portuguese, with English emotional cues.'),
});
export type AnalyzeYouTubeVideoOutput = z.infer<typeof AnalyzeYouTubeVideoOutputSchema>;

export async function analyzeYouTubeVideo(input: AnalyzeYouTubeVideoInput): Promise<AnalyzeYouTubeVideoOutput> {
  return analyzeYouTubeVideoFlow(input);
}

const analyzeTranscriptPrompt = ai.definePrompt({
    name: 'analyzeTranscriptPrompt',
    input: { schema: z.object({ transcript: z.string() }) },
    output: { schema: AnalyzeYouTubeVideoOutputSchema },
    prompt: `You are a creative director and scriptwriter tasked with creating a new video scene inspired by an existing YouTube video. Your goal is to capture the original video's **style, theme, and energy**, but create a **new, original scene**.

Your response MUST be in Brazilian Portuguese for all fields.

Based on the transcript of the original video, please generate the following for the new scene:
1.  **title**: A short, catchy title that reflects the new scene, but is in the same "clickbait" style as the original video.
2.  **setting**: Describe a detailed setting for the new scene that matches the vibe and context of the original video.
3.  **action**: Describe the main action for the new scene. It should be an original action that fits the influencer's style.
4.  **dialogue**: Write a short, original piece of dialogue for the new scene. It should sound like something the person in the original video would say. **Crucially, this dialogue must include emotional cues in English (e.g., (surprised), (laughing)) and emphasize key words or phrases to guide an actor's performance.**

The new scene should be a fresh take, not a direct copy. Use the transcript below as your inspiration for the style and theme.

Transcript for inspiration:
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
    let transcript: { text: string }[] = [];
    try {
      // First, try to fetch the Portuguese transcript.
      transcript = await YoutubeTranscript.fetchTranscript(input.youtubeUrl, { lang: 'pt' });
    } catch (error) {
      console.warn(`Could not fetch 'pt' transcript for ${input.youtubeUrl}, trying default language.`, error);
      try {
        // If Portuguese fails, try fetching the default language transcript.
        transcript = await YoutubeTranscript.fetchTranscript(input.youtubeUrl);
      } catch (fallbackError) {
        // If both attempts fail, 'transcript' will remain an empty array.
        // The check below will catch this and throw a user-friendly error.
        console.error(`Failed to fetch any transcript for ${input.youtubeUrl}`, fallbackError);
      }
    }

    // Check if the transcript is empty or couldn't be fetched.
    if (!transcript || transcript.length === 0) {
      throw new Error("Não foi possível obter a transcrição do vídeo. Verifique se o URL está correto e se o vídeo possui legendas disponíveis (em português ou inglês).");
    }
    
    const transcriptText = transcript.map(t => t.text).join(' ');

    const { output } = await analyzeTranscriptPrompt({ transcript: transcriptText });

    if (!output) {
      throw new Error("A análise da transcrição do vídeo não produziu um resultado.");
    }
    
    return output;
  }
);

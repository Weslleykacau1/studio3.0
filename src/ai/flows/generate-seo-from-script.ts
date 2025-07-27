
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating SEO content for video platforms based on a full script.
 *
 * It exports:
 * - `generateSeoFromScript` - An async function that takes `GenerateSeoFromScriptInput` and returns `GenerateSeoFromScriptOutput`.
 * - `GenerateSeoFromScriptInput` - The input type for the function.
 * - `GenerateSeoFromScriptOutput` - The output type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSeoFromScriptInputSchema = z.object({
  scriptText: z.string().describe('The full text of the video script.'),
});
export type GenerateSeoFromScriptInput = z.infer<typeof GenerateSeoFromScriptInputSchema>;

const GenerateSeoFromScriptOutputSchema = z.string().describe('The generated SEO content in Markdown format.');
export type GenerateSeoFromScriptOutput = z.infer<typeof GenerateSeoFromScriptOutputSchema>;


export async function generateSeoFromScript(input: GenerateSeoFromScriptInput): Promise<GenerateSeoFromScriptOutput> {
  return generateSeoFromScriptFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateSeoFromScriptPrompt',
    input: {schema: GenerateSeoFromScriptInputSchema},
    output: {format: 'text'}, // Output is a markdown string
    prompt: `You are an expert in SEO and social media marketing for content creators. Based on the full video script provided, generate optimized SEO suggestions for YouTube, TikTok, and YouTube Shorts.

The output must be formatted in **Markdown**. For each platform, provide a title, a description (or caption), and relevant hashtags/tags. **All content must be in Brazilian Portuguese.**

**Video Script for Analysis:**
"""
{{{scriptText}}}
"""

---

**Expected Output Format (example):**

## 🚀 SEO for Platforms

### YouTube
- **Título Sugerido:** [Create a "clickbait" but relevant title for YouTube]
- **Descrição:** [Write a detailed description for YouTube, including a summary of the video, CTAs, and relevant links (use placeholders like [LINK]).]
- **Tags:** [List relevant tags, separated by commas, up to a total limit of 500 characters.]

### TikTok
- **Legenda:** [Create a short, engaging caption for TikTok, including a question to drive engagement.]
- **Hashtags:** [#hashtag1 #hashtag2 #hashtag3 #fyp #viral]

### YouTube Shorts
- **Título:** [Create a short, direct title for Shorts, ideally under 60 characters.]
- **Hashtags:** [#shorts #videocurto #hashtag1 #hashtag2]
`
});


const generateSeoFromScriptFlow = ai.defineFlow(
  {
    name: 'generateSeoFromScriptFlow',
    inputSchema: GenerateSeoFromScriptInputSchema,
    outputSchema: GenerateSeoFromScriptOutputSchema,
  },
  async (input) => {
    const {text} = await prompt(input);
    return text;
  }
);

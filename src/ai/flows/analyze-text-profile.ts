// src/ai/flows/analyze-text-profile.ts
'use server';

/**
 * @fileOverview An AI agent to analyze pasted text and extract influencer characteristics.
 *
 * - analyzeTextProfile - A function that handles the text analysis and profile extraction process.
 * - AnalyzeTextProfileInput - The input type for the analyzeTextProfile function.
 * - AnalyzeTextProfileOutput - The return type for the analyzeTextProfile function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextProfileInputSchema = z.object({
  pastedText: z.string().describe('The text containing the influencer description.'),
});
export type AnalyzeTextProfileInput = z.infer<typeof AnalyzeTextProfileInputSchema>;

const AnalyzeTextProfileOutputSchema = z.object({
  name: z.string().describe('The name of the influencer.'),
  niche: z.string().describe('The niche of the influencer.'),
  personality: z.string().describe('The personality traits of the influencer.'),
  appearance: z.string().describe('The physical appearance details of the influencer.'),
  bio: z.string().describe('A short biography of the influencer.'),
  uniqueTrait: z.string().describe('A unique or peculiar trait of the influencer.'),
  negativePrompt: z.string().describe('Negative prompts for image generation to avoid certain characteristics.'),
  age: z.string().describe('The age of the influencer.'),
  gender: z.string().describe('The gender of the influencer.'),
  accent: z.string().describe('The accent of the influencer (Brazilian Portuguese).'),
});
export type AnalyzeTextProfileOutput = z.infer<typeof AnalyzeTextProfileOutputSchema>;

export async function analyzeTextProfile(input: AnalyzeTextProfileInput): Promise<AnalyzeTextProfileOutput> {
  return analyzeTextProfileFlow(input);
}

const analyzeTextProfilePrompt = ai.definePrompt({
  name: 'analyzeTextProfilePrompt',
  input: {schema: AnalyzeTextProfileInputSchema},
  output: {schema: AnalyzeTextProfileOutputSchema},
  prompt: `A partir do seguinte texto, extraia as características de um influenciador. Forneça o resultado como um objeto JSON com as seguintes chaves: "name", "niche", "personality", "appearance", "bio", "uniqueTrait", "negativePrompt", "age", "gender", "accent". **TODOS os valores para estas chaves DEVEM estar em Português do Brasil.** Se um valor para uma chave não for encontrado, deixe-o como uma string vazia.\n\nTexto para analisar:\n"""{{{pastedText}}}"""`,
});

const analyzeTextProfileFlow = ai.defineFlow(
  {
    name: 'analyzeTextProfileFlow',
    inputSchema: AnalyzeTextProfileInputSchema,
    outputSchema: AnalyzeTextProfileOutputSchema,
  },
  async input => {
    const {output} = await analyzeTextProfilePrompt(input);
    return output!;
  }
);

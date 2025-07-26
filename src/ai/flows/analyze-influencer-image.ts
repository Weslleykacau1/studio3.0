// src/ai/flows/analyze-influencer-image.ts
'use server';

/**
 * @fileOverview Analyzes an influencer image to extract character traits.
 *
 * - analyzeInfluencerImage - A function that handles the image analysis process.
 * - AnalyzeInfluencerImageInput - The input type for the analyzeInfluencerImage function.
 * - AnalyzeInfluencerImageOutput - The return type for the analyzeInfluencerImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeInfluencerImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a virtual influencer, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeInfluencerImageInput = z.infer<typeof AnalyzeInfluencerImageInputSchema>;

const AnalyzeInfluencerImageOutputSchema = z.object({
  name: z.string().describe('The name of the influencer.'),
  niche: z.string().describe('The niche of the influencer (e.g., fashion, gaming).'),
  personality: z.string().describe('The personality traits of the influencer.'),
  appearance: z.string().describe('Detailed description of the influencer\'s appearance.'),
  clothing: z.string().describe('Detailed description of the influencer\'s clothing.'),
  bio: z.string().describe('A short biography of the influencer.'),
  uniqueTrait: z.string().describe('A unique or peculiar trait of the influencer.'),
  negativePrompt: z.string().describe('Things to avoid when generating images of the influencer.'),
  age: z.string().describe('The age of the influencer.'),
  gender: z.string().describe('The gender of the influencer.'),
  accent: z.string().describe('The accent of the influencer (Brazilian Portuguese).'),
});
export type AnalyzeInfluencerImageOutput = z.infer<typeof AnalyzeInfluencerImageOutputSchema>;

export async function analyzeInfluencerImage(input: AnalyzeInfluencerImageInput): Promise<AnalyzeInfluencerImageOutput> {
  return analyzeInfluencerImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeInfluencerImagePrompt',
  input: {schema: AnalyzeInfluencerImageInputSchema},
  output: {schema: AnalyzeInfluencerImageOutputSchema},
  prompt: `Analise a imagem de um influenciador virtual fornecida. Crie um perfil detalhado para ele. A saída final DEVE ser um único objeto JSON com as seguintes chaves: 'name', 'niche', 'personality', 'appearance', 'clothing', 'bio', 'uniqueTrait', 'negativePrompt', 'age', 'gender', 'accent'. **TODOS os valores para estas chaves DEVEM estar em Português do Brasil.** Para o campo 'appearance', forneça uma descrição extremamente detalhada das características faciais, incluindo formato do rosto, cor e formato dos olhos, cor e estilo do cabelo, tom de pele, tipo de nariz, formato dos lábios e quaisquer marcas únicas como sardas ou pintas. Para 'clothing', descreva em detalhe as roupas, sapatos e acessórios que o personagem está a usar. Para 'accent', sugira um sotaque brasileiro (ex: 'Paulistano'). Para 'bio', crie uma frase curta e apelativa. Para 'negativePrompt', sugira características a serem evitadas para manter a consistência visual.

Image: {{media url=photoDataUri}}`,
});

const analyzeInfluencerImageFlow = ai.defineFlow(
  {
    name: 'analyzeInfluencerImageFlow',
    inputSchema: AnalyzeInfluencerImageInputSchema,
    outputSchema: AnalyzeInfluencerImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

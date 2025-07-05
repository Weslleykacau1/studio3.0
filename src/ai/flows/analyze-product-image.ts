'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing a product image and generating a product description in Brazilian Portuguese.
 *
 * - analyzeProductImage - A function that handles the product image analysis process.
 * - AnalyzeProductImageInput - The input type for the analyzeProductImage function.
 * - AnalyzeProductImageOutput - The return type for the analyzeProductImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeProductImageInputSchema = z.object({
  productImageDataUri: z
    .string()
    .describe(
      "A product image as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeProductImageInput = z.infer<typeof AnalyzeProductImageInputSchema>;

const AnalyzeProductImageOutputSchema = z.object({
  productDescription: z.string().describe('A detailed description of the product in Brazilian Portuguese.'),
});
export type AnalyzeProductImageOutput = z.infer<typeof AnalyzeProductImageOutputSchema>;

export async function analyzeProductImage(input: AnalyzeProductImageInput): Promise<AnalyzeProductImageOutput> {
  return analyzeProductImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeProductImagePrompt',
  input: {schema: AnalyzeProductImageInputSchema},
  output: {schema: AnalyzeProductImageOutputSchema},
  prompt: `Você é um especialista em análise de produtos. Sua tarefa é examinar a imagem do produto fornecida e extrair uma descrição extremamente detalhada e fiel em Português do Brasil.

**CRÍTICO: A descrição DEVE incluir todas as especificações visíveis no rótulo, embalagem ou no próprio produto. Capture detalhes como nome do modelo, números, ingredientes, instruções, logotipos e qualquer outro texto ou símbolo presente.** O objetivo é criar uma representação fiel do produto para ser usada na geração de uma cena de vídeo.

Use a seguinte imagem como fonte primária de informação sobre o produto:

{{media url=productImageDataUri}}

A sua descrição deve ser detalhada o suficiente para gerar uma imagem convincente e precisa do produto.`, 
});

const analyzeProductImageFlow = ai.defineFlow(
  {
    name: 'analyzeProductImageFlow',
    inputSchema: AnalyzeProductImageInputSchema,
    outputSchema: AnalyzeProductImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

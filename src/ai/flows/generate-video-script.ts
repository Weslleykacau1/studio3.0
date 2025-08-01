'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating video scripts based on influencer traits and scene properties.
 *
 * It exports:
 * - `generateVideoScript` - An async function that takes `VideoScriptInput` and returns a `VideoScriptOutput`.
 * - `VideoScriptInput` - The input type for the `generateVideoScript` function.
 * - `VideoScriptOutput` - The output type for the `generateVideoScript` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VideoScriptInputSchema = z.object({
  influencerName: z.string().describe('The name of the influencer.'),
  influencerPersonality: z.string().describe('The personality traits of the influencer.'),
  influencerAppearance: z.string().describe('A detailed description of the influencer appearance.'),
  influencerNiche: z.string().describe('The content niche of the influencer.'),
  influencerSeed: z.number().describe('The generation seed for the influencer.'),
  influencerAccent: z.string().describe('The accent of the influencer in Portuguese.'),
  sceneTitle: z.string().describe('The title of the video scene.'),
  sceneSetting: z.string().describe('A detailed description of the scene setting.'),
  sceneAction: z.string().describe('The main action occurring in the scene.'),
  sceneDialogue: z.string().optional().describe('Optional dialogue for the scene.'),
  sceneCameraAngle: z.string().describe('The camera angle for the scene.'),
  sceneDuration: z.string().describe('The duration of the scene.'),
  sceneVideoFormat: z.string().describe('The video format (e.g., 9:16).'),
  productName: z.string().optional().describe('The name of the product being featured (if any).'),
  productBrand: z.string().optional().describe('The brand of the product being featured (if any).'),
  productDescription: z.string().optional().describe('Detailed description of the product.'),
  isPartnership: z.boolean().optional().describe('Whether the video is a partnership/sponsored.'),
  allowDigitalText: z.boolean().optional().describe('Whether digital text overlays are allowed in the scene.'),
  onlyPhysicalText: z.boolean().optional().describe('Whether only physical text (e.g., on signs) is allowed.'),
});
export type VideoScriptInput = z.infer<typeof VideoScriptInputSchema>;

const VideoScriptOutputSchema = z.string().describe('The generated video script, in Markdown format.');
export type VideoScriptOutput = z.infer<typeof VideoScriptOutputSchema>;

export async function generateVideoScript(input: VideoScriptInput): Promise<VideoScriptOutput> {
  return generateVideoScriptFlow(input);
}

const generateScriptPrompt = ai.definePrompt({
    name: 'generateFinalVideoScriptPrompt',
    input: {schema: VideoScriptInputSchema},
    output: {format: 'text'},
    prompt: `Você é um roteirista de IA especialista. Sua tarefa é criar um roteiro de vídeo detalhado em formato **Markdown**, com base nas especificações a seguir. O roteiro deve ser estruturado **segundo a segundo** para preencher a duração exata da cena.

**CRÍTICO: Incorpore CADA detalhe do influenciador e da cena no roteiro. Não omita nenhuma informação.**

**Estrutura do Roteiro (use títulos Markdown):**
- **Título:** {{{sceneTitle}}}
- **Personagem Principal:** {{{influencerName}}}
- **Resumo da Cena:** Uma breve descrição da cena.
- **Roteiro Segundo a Segundo:**

---

### Roteiro Detalhado

**Duração Total:** {{{sceneDuration}}}

**Formato:** {{{sceneVideoFormat}}}

**0s-1s:**
- **Visual:** [Descreva o que aparece, o enquadramento, o ângulo da câmara: **{{{sceneCameraAngle}}}**. A aparência do personagem DEVE ser: **{{{influencerAppearance}}}**]
- **Áudio/SFX:** [Descreva os sons ambientes ou efeitos sonoros]

**1s-2s:**
- **Visual:** [Continue a descrever a ação: **{{{sceneAction}}}**. Mantenha a consistência do personagem e do cenário: **{{{sceneSetting}}}**]
{{#if sceneDialogue}}
- **Diálogo ({{influencerName}}}):** [Adapte esta ideia de diálogo para o tempo: **{{{sceneDialogue}}}**. O diálogo DEVE estar em Português do Brasil com o sotaque **{{{influencerAccent}}}** e incluir dicas de emoção em inglês, como (surpreso) ou (animado).]
{{/if}}

... continue a detalhar segundo a segundo até atingir a duração total de **{{{sceneDuration}}}**.

{{#if productName}}
**Integração do Produto:**
- O produto **{{{productName}}}** da marca **{{{productBrand}}}** deve ser apresentado de forma natural.
- **Descrição do produto a ser usada:** {{{productDescription}}}.
- {{#if isPartnership}}Esta é uma parceria paga, mencione isso se apropriado.{{/if}}
{{/if}}

**Estilo e Tom:**
- O roteiro deve refletir a personalidade do influenciador: **{{{influencerPersonality}}}**.
- O nicho é **{{{influencerNiche}}}**, então o conteúdo deve ser relevante.

**Restrições de Texto:**
- Textos digitais na tela: {{#if allowDigitalText}}Sim{{else}}Não{{/if}}.
- Apenas textos físicos (placas, etc.): {{#if onlyPhysicalText}}Sim{{else}}No{{/if}}.
`
});


const generateVideoScriptFlow = ai.defineFlow(
  {
    name: 'generateVideoScriptFlow',
    inputSchema: VideoScriptInputSchema,
    outputSchema: VideoScriptOutputSchema,
  },
  async input => {
    // Create a mutable copy of the input
    let processedInput = { ...input };

    // Check for the dynamic camera option and replace it with a detailed instruction for the AI.
    if (processedInput.sceneCameraAngle === 'Câmera Dinâmica (Criatividade da IA)') {
      processedInput.sceneCameraAngle = "Seja criativo e use ângulos de câmera dinâmicos e profissionais. Utilize uma variedade de planos, como close-ups, planos abertos, planos de acompanhamento e ponto de vista para tornar a cena visualmente envolvente, como se fosse dirigida por um cineasta profissional.";
    }

    const {text} = await generateScriptPrompt(processedInput);
    if (!text) {
        throw new Error("A geração do roteiro falhou ao não retornar dados. Tente novamente.");
    }
    return text;
  }
);

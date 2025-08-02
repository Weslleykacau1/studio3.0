
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
    prompt: `You are an expert screenwriter and director. Your task is to create a highly detailed, second-by-second video script in **Markdown** format. The script must perfectly match the specified duration.

**CRITICAL INSTRUCTIONS:**
1.  **Use All Provided Details:** You **MUST** incorporate every single detail about the influencer and the scene into the script. Do not omit any information.
2.  **Second-by-Second Breakdown:** Structure the script with a Markdown heading for each second (e.g., \`### Second 1\`, \`### Second 2\`). The number of seconds must match the scene duration.
3.  **Detailed Elements per Second:** For each second, you **MUST** provide descriptions for:
    *   **Visual:** Describe camera work, character actions, and expressions in detail. Adhere strictly to the requested camera angle (\`{{{sceneCameraAngle}}}\`) and character appearance (\`{{{influencerAppearance}}}\`). The setting must be \`{{{sceneSetting}}}\`.
    *   **Audio:** Write the dialogue for that specific second. The dialogue must be in **Brazilian Portuguese** with the specified accent (\`{{{influencerAccent}}}\`) and include emotional cues in English (e.g., \`(Calmly, with conviction)\`). If no dialogue is provided (\`{{{sceneDialogue}}}\`), create one that fits the context, personality (\`{{{influencerPersonality}}}\`) and action (\`{{{sceneAction}}}\`).
    *   **SFX:** Describe appropriate sound effects or ambient sounds.
4.  **Product Integration:** If a product is mentioned (\`{{{productName}}}\`), it must be naturally integrated into the visual and action descriptions.
5.  **Adherence to Format:** Follow the provided script example structure precisely.

---
**EXAMPLE STRUCTURE TO FOLLOW:**

# Roteiro do Vídeo: [Título da Cena]

**Influenciador:** [Nome do Influenciador] (Seed: [Seed])
*   **Personalidade:** [Personalidade]
*   **Aparência:** [Aparência]
*   **Nicho:** [Nicho]

**Cena:**
*   **Cenário:** [Cenário]
*   **Ação:** [Ação Principal]
*   **Duração:** [Duração]
*   **Formato do Vídeo:** [Formato]

**Detalhes Técnicos:**
*   **Ângulos de Câmara:** [Ângulo da Câmara]
*   **Texto Digital:** [Sim/Não]
*   **Texto Físico:** [Sim/Não]

---

## Roteiro:

**[INÍCIO DA CENA]**

### Segundo 1
*   **Visual:** [Descrição detalhada do visual para este segundo]
*   **Áudio:** [Diálogo para este segundo]
*   **SFX:** [Efeitos sonoros para este segundo]

### Segundo 2
*   **Visual:** [Descrição detalhada do visual para este segundo]
*   **Áudio:** [Diálogo para este segundo]
*   **SFX:** [Efeitos sonoros para este segundo]

(... continue para cada segundo da duração ...)

**[FIM DA CENA]**

---
**SCRIPT DETAILS TO USE:**

*   **Video Script Title:** {{{sceneTitle}}}
*   **Influencer Name:** {{{influencerName}}}
*   **Influencer Seed:** {{{influencerSeed}}}
*   **Influencer Personality:** {{{influencerPersonality}}}
*   **Influencer Appearance:** {{{influencerAppearance}}}
*   **Influencer Niche:** {{{influencerNiche}}}
*   **Scene Setting:** {{{sceneSetting}}}
*   **Scene Main Action:** {{{sceneAction}}}
*   **Scene Duration:** {{{sceneDuration}}}
*   **Scene Video Format:** {{{sceneVideoFormat}}}
*   **Scene Camera Angles:** {{{sceneCameraAngle}}}
*   **Allow Digital Text:** {{{allowDigitalText}}}
*   **Only Physical Text:** {{{onlyPhysicalText}}}
*   **Dialogue (use if provided, otherwise create):** {{#if sceneDialogue}}{{{sceneDialogue}}}{{else}}Nenhum diálogo especificado.{{/if}}
*   **Product Name (if any):** {{{productName}}}
*   **Product Description (if any):** {{{productDescription}}}
`,
});

const generateVideoScriptFlow = ai.defineFlow(
  {
    name: 'generateVideoScriptFlow',
    inputSchema: VideoScriptInputSchema,
    outputSchema: VideoScriptOutputSchema,
  },
  async input => {
    let processedInput = { ...input };

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
